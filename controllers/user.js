const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const CastError = require('../errors/cast-error');
const ValidationError = require('../errors/validation-error');
const WrongKeys = require('../errors/wrong-keys');
const RepeatName = require('../errors/repeat-name');
const NotNewInfo = require('../errors/not-new-info');

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError();
      }
      let {name, surname, email, phone, company, jobpost, avatar} = user
      return res.status(200).send({
        name,
        surname,
        email,
        phone,
        company,
        jobpost,
        avatar
      });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CastError());
      } else {
        next(err);
      }
    });
};

module.exports.getAva = (req, res, next) => {
  User.find({ _id: req.params.userId })
  .then((mess) => {
    //console.log(mess)
    return res.status(200).send({
      avatar: mess[0].avatar,
      name: mess[0].name,
      surname: mess[0].surname,
      status: 'ok',
    });
  })
  .catch(next);
}

module.exports.getAllUsers = (req, res, next) => {
  User.find({ })
  .then((mess) => {
    return res.status(200).send({
      users: mess,
      status: 'ok',
    });
  })
  .catch(next);
}

module.exports.updateUser = (req, res, next) => {
  let {name, surname, email, phone, company, jobpost, avatar} = req.body
  console.log(req.body)
  User.findOne({ name })
    .then((info) => {
      if (info === null) {
        console.log(' 3')
        updateNewInfo(name, surname, email, phone, company, jobpost, avatar, req.user._id, res, next);
      } else if ((req.user._id !== info._id.toString())) {
        next(new RepeatName());
      } else if (
        (info.name === name) &&
        (info.surname === surname) &&
        (info.email === email) &&
        (info.phone === phone) &&
        (info.company === company) &&
        (info.jobpost === jobpost)
      ) {
        throw new NotNewInfo();
      } else if (info.email === email) {
        updateNewInfo(name, surname, email, phone, company, jobpost, avatar, req.user._id, res, next);
      } else {
        next(new RepeatName());
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError());
      } else if (err.name === 'NotFoundError') {
        next(new NotFoundError());
      } else {
        next(err);
      }
    });
};

function updateNewInfo(name, surname, email, phone, company, jobpost, avatar, id, res, next) {
  console.log(' 4 ')
  User.findByIdAndUpdate(
    {
      _id: id,
    },
    {
      name, surname, email, phone, company, jobpost, avatar
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      console.log(' 5 ')
      if (!user) {
        throw new NotFoundError();
      }
      let {name, surname, email, phone, company, jobpost, avatar} = user
      console.log(' 6 ')
      return res.status(200).send({
        name, surname, email, phone, company, jobpost, avatar
      });
    })
    .catch((err) => {
      console.log(err)
      next(err);
    });
}
