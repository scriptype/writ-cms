---
name: Person
attributes:
  articles: [+Article:author]
  demos: [+Demo:maker]
  events: [+Event:organizers, +Event:participants]
  books: [+Book:author]
  twin: +Person:twin
---
