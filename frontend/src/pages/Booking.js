import React, { useState, useEffect, useContext } from 'react';
import Spinner from '../components/Spinner';
import AuthContext from '../context/auth-context';
import BookingList from '../components/BookingList';
import Error from '../components/Error';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState('');
  const value = useContext(AuthContext);
  const endpoint = 'http://localhost:4000/graphql';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${value.token}`,
  };
  const fetchBookings = () => {
    setIsLoading(true);
    const requestQuery = {
      query: `
        query {
          bookings {
            _id
            createdAt
            event {
              _id
              title
              date
              price
            }
          }
        }
      `,
    };
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestQuery),
      headers: headers
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          setAlert("حدث خطأ ما!!")
          throw new Error(alert);
        }
        return res.json();
      })
      .then(resData => {
        if(resData.errors && resData.errors.length>0) setAlert(resData.errors[0].message);
        const Userbookings = resData.data.bookings;
        setBookings(Userbookings);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const cancelBookingHandler = bookingId => {
    const requestQuery = {
      query: `
        mutation CancelBooking($bookingId: ID!){
          cancelBooking(bookingId: $bookingId) {
            _id
            title
          }
        }
      `,
      variables: {
        bookingId,
      },
    };

    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestQuery),
      headers: headers
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          setAlert("حدث خطأ ما!!")
          throw new Error(alert);
        }
        return res.json();
      })
      .then((resData) => {
        if(resData.errors && resData.errors.length>0) setAlert(resData.errors[0].message);
        else{
          setBookings(bookings.filter(booking => booking._id !== bookingId));
          setAlert("تم إلغاء حجزك");
        }
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchBookings();
  }, []); // eslint-disable-line

  return (
    <>
      <Error error={alert}/>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div>
            <h2>الأحداث التي حجزتها</h2>
            <BookingList
              bookings={bookings}
              onCancelBooking={cancelBookingHandler}
            />
          </div>
        </>
      )}
    </>
  );
}