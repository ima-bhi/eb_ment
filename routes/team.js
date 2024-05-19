// index.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Team = require('../models/team.model');
const TeamSubscription = require('../models/teamSubscribe.model');
const TeamNotification = require('../models/TeamNotification.model');
const moment = require('moment');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).send('Access denied');
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send('Access denied');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(400).send('Invalid token');
  }
};
router.post('/create', authenticate, async (req, res) => {
  const { placeholder } = req.body;
  const team = await Team.findOne({ placeholder: placeholder });
  if (!team) {
    //team is not created yet
    await Team.create(req.body);
    res.status(201).send('TEAM CREATE SUCCESSFULLY');
  } else {
    res.status(400).send('TEAM ALREADY EXIST');
  }
});

//get teamSubscription details
router.get('/:userId/Details', authenticate, async (req, res) => {
  const { userId } = req.params;
  //get all notification
  const data = await Team.findOne({ userId: userId });
  res.status(201).json({ message: 'Subscription Info', data: data });
});

//team subsc
router.post('/subscription', authenticate, async (req, res) => {
  const { userId } = req.body;
  const TeamSub = await TeamSubscription.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  });
  if (!TeamSub) {
    const body = {
      userId: req.body.userId,
      teamId: req.body.teamId,
      subscribedAt: moment().format('YYYY-MM-DD'),
    };
    //team is not created yet
    await TeamSubscription.create(body);
    const tNotification = {
      userId: req.body.userId,
      teamId: req.body.teamId,
      title: 'Onboard Message',
      message: 'Thanks for subscribing to our team - hang on for more updates!',
      date: moment().format('YYYY-MM-DD'),
    };
    //push one notification
    await TeamNotification.create(tNotification);
    res.status(201).send('USER - TEAM MAPPING DONE');
  } else {
    const body = {
      userId: req.body.userId,
      teamId: req.body.teamId,
      subscribedAt: moment().format('YYYY-MM-DD'),
    };
    //update the team
    await TeamSubscription.deleteOne({
      _id: new mongoose.Types.ObjectId(TeamSub._id),
    });

    //deletMany old notification
    await TeamNotification.deleteMany({
      userId: req.body.userId,
    });
    //create again
    await TeamSubscription.create(body);

    //again push default message
    const tNotification = {
      userId: req.body.userId,
      teamId: req.body.teamId,
      title: 'Onboard Message',
      message: 'Thanks for subscribing to our team - hang on for more updates!',
      date: moment().format('YYYY-MM-DD'),
    };
    //push one notification
    await TeamNotification.create(tNotification);
    res.status(400).send('USER _TEAM MAPPING UPDATE');
  }
});

//update Team info
router.post('/:teamId/notifications', authenticate, async (req, res) => {
  const { teamId } = req.params;
  const { title, message } = req.body;

  //Step 1: find all user-team mapping
  const TeamSub = await TeamSubscription.find(
    {
      teamId: new mongoose.Types.ObjectId(teamId),
    },
    { userId: 1 }
  );
  const userIds = TeamSub.map((subscription) => subscription.userId.toString());
  if (userIds.length == 0) {
    res.status(400).send('NO USER SUBSCRIBE THE TEAM YET');
  }

  //now create mapping
  await Promise.all(
    userIds.map(async (stu) => {
      const tNotification = {
        userId: stu,
        teamId: teamId,
        title: title,
        message: message,
        date: moment().format('YYYY-MM-DD'),
      };
      //push one notification
      await TeamNotification.create(tNotification);
    })
  );
  res.status(201).send('NOTIFICATION UPLOAD SUCCESSFULLY');
});

// get notification a/c to userId
router.get('/user/:userId/notifications', authenticate, async (req, res) => {
  const { userId } = req.params;
  //get all notification
  const data = await TeamNotification.find(
    { userId: userId },
    { title: 1, message: 1, isread: 1 }
  ).sort({
    createdAt: -1,
  });
  res.status(201).json({ message: 'Notification Info', data: data });
});

//update usrnotification
router.patch('/notification/:nId', authenticate, async (req, res) => {
  const { nId } = req.params;
  //get all notification
  await TeamNotification.updateOne({ _id: nId }, { isread: true });
  res
    .status(201)
    .json({ message: 'Notification Read Status Update Successfully' });
});
module.exports = router;
