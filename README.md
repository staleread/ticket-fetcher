# ticket-fetcher

## Task

Build a simple service which will fetch concert tickets from a [website](https://www.centertheatregroup.org/booking/syos?perf_no=21920&facility_no=10)
and return them to user through a HTTP call

Ticket data should contain these fields:

- Section
- Row
- Seat number
- Price

P.S. If it doesn't have tickets anymore - please use any other event on this platform

## Principles

- Implement all with Typescript
- Implement with Nest.js
- Try to keep CPU complexity as little as possible
- Try to follow layered architecture principles: separate business logic from third-party integrations, etc.

## Bonus points:

- Use GraphQL as a way to query your service
- Add e2e test that demonstrate that everything works as expected

## Definition of Done:

- Service can be launched with a command npm start
- Tests can be launched on any environment and they will be green
- Tests are verifying that app works as expected
- App can be queries through GraphQL endpoint to fetch available tickets for specific event ID.
