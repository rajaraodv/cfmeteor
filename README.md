CFMeteor
============

CFMeteor is a helper module that helps run <http://www.meteor.com> apps on Cloud Foundry

Usage:
------
#### Step 1: Extract Meteor.com app's _*entire*_ source:

	
1. Create a Meteor app by following instructions here: <http://docs.meteor.com/#quickstart>

2. But instead of deploying to meteor.com's servers by doing 'meteor deploy app.meteor.com', we will install on Cloud Foundry.

3. Inside the `myapp` folder, do: `meteor bundle` - this collects all the libraries required and creates a bundle.tar.gz file 

4. Untar the bundle tarball: `tar -xvzf bundle.tar.gz` to `myapp/bundle/` 

#### Step 2: Install cfmeteor module & load it:

1. From now on `myapp/bundle` folder is the **actual app**.

2. `CD into myapp/bundle/server/node_modules` and `git clone https://rajaraodv@github.com/rajaraodv/cfmeteor.git`

3. Open `bundle/server/server.js` and add `require("cfmeteor");` as the first line so that this cfmeteor module is run before anything else.

#### Step 3: Uploading meteor.com apps to Cloud Foundry:
1. From inside, `myapp/bundle`, do `vmc push myapp --runtime node06`

2. And when vmc asks for "Do you need any services?", bind to MongoDB service (db service name doesn't matter) 

3. That's it, you should have your app fully working by now.


Details
-----
This module provides following:

1. Ubuntu pre-compiled fibers module:
Meteor apps need 'node-fibers' module. But Node-fibers module is essentially C++ extension and needs compiling before it can be used. Cloud Foundry runs on Ubuntu and so we can't just upload fibers module that's compiled on developer's (mostly mac or windows). This module comes with Ubuntu compiled fibers.

	But, Meteor.com apps already comes with fibers module, so this script automatically replaces the default one with Ubuntu one when running on Cloud Foundry(only over there - so that you can run this app both locally and on CF w/o any further changes).

2. Sets process.env.PORT & process.env.MONGO_URL values required by Meteor.com app


License
-------
MIT license
