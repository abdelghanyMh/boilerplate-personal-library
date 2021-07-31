/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let deleteME;

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done) {
    chai.request(server)
      .get('/api/books')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {

      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .set('content-type', 'application/json')
          .send({ title: 'post_test' })
          .end((err, res) => {
            assert.property(res.body, '_id', 'response should conatain _id');
            assert.equal(res.body.title, "post_test");
            deleteME = res.body._id;

            done();
          })
      });

      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .end((err, res) => {
            assert.equal(res.body, 'missing required field title');
            done();
          })
      });

    });


    suite('GET /api/books => array of books', function() {

      test('Test GET /api/books', function(done) {
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            done();
          });
      });

    });


    suite('GET /api/books/[id] => book object with [id]', function() {

      test('Test GET /api/books/[id] with id not in db', function(done) {//

        chai.request(server)
          .get('/api/books/61042ee300954e04955e023A')
          .end(function(err, res) {
            console.log(res.body);
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function(done) {

        chai.request(server)
          .get('/api/books/61042ee300954e04955e022e')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            // assert.deepEqual(res.body, 'response should be an array');
            assert.property(res.body, 'commentcount', 'Book should contain commentcount');
            assert.property(res.body, 'title', 'Book should contain title');
            assert.equal(res.body._id, '61042ee300954e04955e022e', 'this book should have the _id:61042ee300954e04955e022e ');
            done();
          });
      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function() {

      test('Test POST /api/books/[id] with comment', function(done) {
        chai.request(server)
          .post('/api/books/6104644241414f1d0e1e96de')
          .set('content-type', 'application/json')
          .send({ comment: 'post_id_test_comment' })
          .end((err, res) => {
            assert.equal(res.body._id, '6104644241414f1d0e1e96de');
            assert.equal(res.body.title, "POST_ID_TEST_TITLE");
            assert.equal(res.body.comments[0], 'post_id_test_comment');
            done();
          })
      });

      test('Test POST /api/books/[id] without comment field', function(done) {
        chai.request(server)
          .post('/api/books/6104644241414f1d0e1e96de')

          .end((err, res) => {
            assert.equal(res.body, 'missing required field comment');
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done) {
        chai.request(server)
          .post('/api/books/6104644241414f1d0e1e96dA')
          .set('content-type', 'application/json')
          .send({ comment: 'this will not be stored' })
          .end((err, res) => {
            assert.equal(res.body, 'no book exists');
            done();
          });
      });

    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done) {

        chai.request(server)
          .delete(`/api/books/${deleteME}`)
          .end((err, res) => {
            assert.equal(res.body, 'delete successful');
            done();
          });

      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done) {
        // ' delete unsuccessful'
        chai.request(server)
          .delete(`/api/books/6104644241414f1d0e1e96dA`)
          .end((err, res) => {
            assert.equal(res.body, 'no book exists');
            done();
          });

      });
    });

  });
});