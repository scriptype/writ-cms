---
model: entry
description: Schema for a person entry
attributes:
  - key: avatar
    type: ImageAttachment
    description: An image that represents the person
  - key: twin
    type: +Person:twin
    description: Twin of the person
  - key: articles
    type: [+Article:author]
    description: List of articles the person has authored
  - key: demos
    label: Demos & stuff
    type: [+Demo:maker]
    description: List of demos the person has created
  - key: events
    type: [+Event:organizers, +Event:participants]
  - key: books
    type: [+Book:author]
---
