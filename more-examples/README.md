# JS SDK API Example

This example is intended to run through all the various methods of the JS SDK.

# Prerequisites

<a href="https://www.stackmob.com/platform/api/schemas/create" target="_blank">Create these schemas</a> and <a href="https://www.stackmob.com/devcenter/docs/Schema-Relationships">relationships</a> for your example app:

* `message` schema with a `string` field named `content`
* `user` schema with a `one to many` relationship with a `message` schema.
* `attraction` schema with a `geopoint` field named `location`

# Facebook Example Prerequisites

* user schema with Facebook methods enabled
* Facebook App ID (optional)

# Running this example

<a href="https://developer.stackmob.com/sdks/js/config">Initialize the JS SDK</a> in the index.html

Click on the various links to trigger an API call.  Some examples require you to click on one link before another.  For instance, you can only "Read a User" after you "Create a User".  It should generally be intuitive.  


