import { gql } from '@apollo/client'

export const CREATE_EVENT = gql`
   mutation CreateEvent($title: String!, $description: String!, $price: Float!, $date: String!) {
        createEvent(eventInput: {title: $title, description: $description, price: $price, date: $date}) {
            _id
            title
            description
            price
            date
        }
    }
`
export const EVENT_ADDED = gql`
  subscription {
    eventAdded {
      _id
      title
      date
      description
    }
  }
`