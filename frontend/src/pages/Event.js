import React, { useState, useRef, useContext, useEffect } from 'react';
import Modal from '../components/Modal';
import Backdrop from '../components/Backdrop';
import AuthContext from '../context/auth-context';
import EventList from '../components/EventList';
import Spinner from '../components/Spinner';
import { NavLink } from 'react-router-dom';
import Error from '../components/Error';
import { useSubscription } from '@apollo/client'
import { EVENT_ADDED } from '../queries'

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [creating, setCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [alert, setAlert] = useState('');
  const titleEl = useRef(null);
  const priceEl = useRef(null);
  const dateEl = useRef(null);
  const descriptionEl = useRef(null);
  const value = useContext(AuthContext);
  const endpoint = 'http://localhost:4000/graphql';
  const headers = {
    'Content-Type': 'application/json',
    authorization: value.token ? `bearer ${value.token}` : null,
  };

  useSubscription(EVENT_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      if(subscriptionData.data){
        const addedEvent = subscriptionData.data.eventAdded;
        setAlert(`حدث جديد بعنوان: ${addedEvent.title}، أُضيف للتو`);
        fetchEvents();
      }
      if(subscriptionData.errors) setAlert("خطأ في جلب الأحداث الجديدة");
    }
  })

  const eventConfirmHandler = () => {
    const title = titleEl.current.value;
    const price = +priceEl.current.value;
    const date = dateEl.current.value;
    const description = descriptionEl.current.value;
    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      setAlert("خطأ في المدخلات!!");
      return;
    }

    const requestQuery = {
      query: `
        mutation CreateEvent($title: String!, $description: String!, $price: Float!, $date: String!) {
          createEvent(eventInput: {title: $title, description: $description, price: $price, date: $date}) {
            _id
            title
            description
            price
            date
          }
        }
      `,
      variables: {
        title,
        description,
        price,
        date,
      },
    };

    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestQuery),
      headers: headers
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          setAlert("faild")
          throw new Error(alert);
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        if(resData.errors && resData.errors.length>0) setAlert(resData.errors[0].message);
        else{
          setEvents([
            ...events,
            { ...resData.data.createEvent, creator: { _id: value.userId } },
          ]);
          setAlert("تم إضافة الحدث بنجاح");
        }
      })
      .catch(err => console.log(err));

    setCreating(false);
  };

  const fetchEvents = () => {
    setIsLoading(true);
    const requestQuery = {
      query: `
        query {
          events{
            _id
            title
            description
            price
            date
            creator {
              _id
              email
            }
          }
        }
      `,
    };

    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestQuery),
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          setAlert("حدث خطأ ما!!");
          throw new Error(alert);
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        if(resData.errors && resData.errors.length>0) setAlert(resData.errors[0].message);
        const allEevents = resData.data.events;
        setEvents(allEevents);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const showDetailHandler = eventId => {
    const clickedEvent = events.find(event => event._id === eventId);
    setSelectedEvent(clickedEvent);
  };

  const bookEventHandler = () => {
    if (!value.token) {
      setSelectedEvent(null);
      return;
    }
    const requestQuery = {
      query: `
        mutation BookEvent($eventId: ID!) {
          bookEvent(eventId: $eventId) {
            _id
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        eventId: selectedEvent._id,
      },
    };

    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestQuery),
      headers: headers
    })
      .then(res => {
        console.log(res);
        if (res.status !== 200 && res.status !== 201) {
          setAlert("حدث خطأ ما!!");
          throw new Error(alert);
        }
        return res.json();
      })
      .then(resData => {
        if(resData.errors && resData.errors.length>0) setAlert(resData.errors[0].message);
        else{
          setSelectedEvent(null);
          setAlert("تم حجز الحدث بنجاح");
        }
      })
      .catch(err => console.log(err));
      setSelectedEvent(null);
  };

  useEffect(() => {
    fetchEvents();
  }, []); // eslint-disable-line

  return (
    <React.Fragment>
      {value.token && <Error error={alert}/>}
      {(creating || selectedEvent) && <Backdrop />}
      {creating && (
        <Modal
          title='إضافة حدث'
          canCancel
          canConfirm
          onCancel={() => {setCreating(false); setAlert("");}}
          onConfirm={eventConfirmHandler}
          confirmText='تأكيد'
        >
          <form>
            <div className='form-control'>
              <label htmlFor='title'>العنوان</label>
              <input required type='text' id='title' ref={titleEl} />
            </div>
            <div className='form-control'>
              <label htmlFor='price'>السعر</label>
              <input required type='number' id='price' ref={priceEl} />
            </div>
            <div className='form-control'>
              <label htmlFor='date'>التاريخ</label>
              <input required type='datetime-local' id='date' ref={dateEl} />
            </div>
            <div className='form-control'>
              <label htmlFor='description'>التفاصيل</label>
              <textarea required id='description' rows='4' ref={descriptionEl} />
            </div>
          </form>
        </Modal>
      )}
      {selectedEvent && (
        <Modal
          title='حجز موعد'
          canCancel
          canConfirm
          onCancel={() => {
            setCreating(false);
            setSelectedEvent(false);
            setAlert("");
          }}
          onConfirm={bookEventHandler}
          confirmText={value.token ? 'احجز' : <NavLink to='/auth'>سجل دخول لتحجز</NavLink>}>
          <h1>{selectedEvent.title}</h1>
          <h2>
            ${selectedEvent.price} -{' '}
            {new Date(selectedEvent.date).toLocaleDateString()}
          </h2>
          <p>{selectedEvent.description}</p>
        </Modal>
      )}
      {value.token && (
        <div className='events-control'>
          <h2>شارك أحداثك الخاصة!</h2>
          <button className='btn' onClick={() => setCreating(true)}>
            إنشاء حدث
          </button>
        </div>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
          <>
            <div>
              <h2>الأحداث من حولك!!</h2>
              <EventList
                events={events}
                authUserId={value.userId}
                onViewDetail={showDetailHandler}
                />
            </div>
          </>
      )}
    </React.Fragment>
  );
}
