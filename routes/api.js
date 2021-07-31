/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const ObjectID = require('mongodb').ObjectID;

module.exports = function(app, myDataBase) {

  app.route('/api/books')
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      myDataBase.find({})
        .toArray(function(err, result) {
          if (err) throw err;
          res.send(result);
        })
    })

    .post(function(req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title)
        return res.json('missing required field title');
      myDataBase.insertOne({
        title: title,
        comments: [],
        commentcount: 0

      }, (err, response) => {
        if (err) {
          res.send("error");
        }
        else {
          // The inserted document is held within
          // the ops property of the response
          const { _id, title } = response.ops[0];
          return res.json({ _id, title });
        }
      })
    })

    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      const query = { $and: [{ title: { $ne: 'GET_TEST' } }, { title: { $ne: 'POST_ID_TEST_TITLE' } }] }; //prevent delting documents used in tests
      myDataBase.deleteMany(query, (err, result) => {
        if (err) throw err;
        else return res.json('complete delete successful')

      })

    });



  app.route('/api/books/:id')
    .get(function(req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      if (!bookid) {
        res.json({ error: "missing _id" });
        return;
      }
      myDataBase.find({ _id: new ObjectID(bookid) })
        .toArray(function(err, result) {
          if (err) throw err;
          else if (result.length === 0) {
            return res.json('no book exists')
          }
          else
            res.send(...result);
        })
    })

    .post(function(req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!bookid) {
        res.json({ error: "missing _id" });
        return;
      }
      if (!comment)
        return res.json('missing required field comment');

      const query = { _id: new ObjectID(bookid) };
      // Set some fields in that document
      const update = {
        $push: { comments: comment },
        $inc: { commentcount: 1 }
      };
      // Return the updated document instead of the original document
      const options = { returnDocument: 'after' };

      myDataBase.findOneAndUpdate(query, update, options, (err, doc) => {
        if (err) {
          throw err;
        }
        else if (!doc.lastErrorObject.updatedExisting && doc.value == null)
          return res.json('no book exists')

        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}




        res.json(doc.value);
      });


    })

    .delete(function(req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      const query = { _id: new ObjectID(bookid) };

      myDataBase.deleteOne(query, (err, result) => {
        if (err) throw err;
        else if (result.deletedCount === 0) return res.json('no book exists')
        else if (result.deletedCount === 1) return res.json('delete successful')
      })
    });

  //404 Not Found Middleware
  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
};
