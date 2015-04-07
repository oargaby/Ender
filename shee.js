// Assuming the following directory structure
/*
  app/
    .meteor/
    client/
    server/
    collections/
*/

// 1. Create a collection
// Sets up collection in db and creates a repository to access documents from db
// ----------------------
// -collections/posts.js-
Posts = new Meteor.Collection('posts');
// this code is run on the client and server
// on the server, it creates the collection in mongodb and acts as a repository
// on the client it creates a repository which accesses "minimongo" which will be populated by a subscription later

// 2. Make some fixture data
// Figure out what your data should look like, write some json objects and insert them into the db when it's empty
// ----------------------
// -server/fixtures.js-
if (Posts.find().count() === 0) {
  Posts.insert({
    title: 'Introducing Telescope',
    author: 'Sacha Greif',
    url: 'http://sachagreif.com/introducing-telescope/',
    details: "Long paragraph that we don't want to show on the list page, so only show in detail view"
  });

  Posts.insert({
    title: 'Meteor',
    author: 'Tom Coleman',
    url: 'http://meteor.com',
    details: "Long paragraph that we don't want to show on the list page, so only show in detail view"
  });

  Posts.insert({
    title: 'The Meteor Book',
    author: 'Tom Coleman',
    url: 'http://themeteorbook.com',
    details: "Long paragraph that we don't want to show on the list page, so only show in detail view"
  });
}

// 3. Create a publication
// From the server, you need to publish the data the clients should have access to
// No REST in Meteor, need to start thinking in terms of publications and subscriptions
// ----------------
// -server/publications.js-
Meteor.publish('allPosts', function() {
  return Posts.find();
});

// 4. Subscibe to publications
// ----------------
// -client/main.js- *main.js is loaded after everything else
Meteor.subscribe('allPosts');

// 5. Create basic templates and managers
// There are several basic templates we should make for each collection
//  1) Collection View

// -client/posts/posts.html
<template name="posts">
  {{#each posts}}
    {{> postItem}}
  {{/each}}
</template>

// -client/posts/posts.js
Template.posts.helpers({
  posts: function() {
    return Posts.find().map(function(post) { 
      // edit each item client side here if you want
    });
  }
});

//  2) Collection Item View (for collection)

// -client/posts/postItem.html
<template name="postItem">
  <h1>
    <a href="{{url}}">{{title}}</a>
    <small>{{author}}</small>
  </h1>
</template>

//  3) Detail View
<template name="postDetail">
  <h1>
    <a href="{{url}}">{{title}}</a>
    <small>{{author}}</small>
  </h1>
  <section>
    {{details}}
  </section>
</template>

//  4) Edit view
// ** should be able to use as create as well
// ** maybe check out x-editable on detail view and set "editMode" session variable?
// ----------------
<template name="postEdit">
  <form>
    <input type="text" name="title" value="{{title}}" placeholder="Enter Title" />
    <input type="text" name="url" value="{{url}}" placeholder="Enter URL" />
    <input type="text" name="author" value="{{author}}" placeholder="Enter Author" />
    <input type="text" name="details" value="{{details}}" placeholder="Enter Details" />
    
    <input type="submit" value="Submit" />
  </form>
</template>

Template.postEdit.events({
  "submit form": function(e) {
    e.preventDefault();
    
    var post = {
      url: $(e.target).find('[name=url]').val(),
      title: $(e.target).find('[name=title]').val(),
      author: $(e.target).find('[name=author]').val(),
      details: $(e.target).find('[name=details]').val(),
    }
    
    Meteor.call('editPost', post, function(error, id) {
      if (error) {
        throwError(error.reason);
      } else {
        Meteor.Router.to('postDetail', id);
      }
    });
  }
});

// in collections/posts.js add
Meteor.methods({
  post: function(postAttributes) {
    var user = Meteor.user(),
      postWithSameLink = Posts.findOne({url: postAttributes.url});
    
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to post new stories");
    
    // ensure the post has a title
    if (!postAttributes.title)
      throw new Meteor.Error(422, 'Please fill in a headline');
    
    // check that there are no previous posts with the same link
    if (postAttributes.url && postWithSameLink) {
      throw new Meteor.Error(302, 
        'This link has already been posted', 
        postWithSameLink._id);
    }
    
    // pick out the whitelisted keys
    var post = _.extend(_.pick(postAttributes, 'url', 'title', 'message'), {
      userId: user._id, 
      author: user.username, 
      submitted: new Date().getTime(),
      commentsCount: 0,
      upvoters: [], votes: 0
    });
    
    var postId = Posts.insert(post);
    
    return postId;
  }
});



// more publication examples
Meteor.publish('newPosts', function(limit) {
  return Posts.find({}, {sort: {submitted: -1}, limit: limit});
});
Meteor.publish('singlePost', function(id) {
  return id && Posts.find(id);
});
//related to post
Meteor.publish('comments', function(postId) {
  return Comments.find({postId: postId});
});
// all that belong to user
Meteor.publish('notifications', function() {
  return Notifications.find({userId: this.userId});
});

// complex example, partial publication, partial properties
Meteor.publish('allPosts', function(){
  return Posts.find({'author':'Tom'}, {fields: {
    date: false
  }});
});

# COMMANDS:

$ kill -9 `ps ax | grep node | grep meteor | awk '{print $1}'`  # to kill meteor

$ meteor help
$ meteor run [--port] [--production] [--raw-logs] [--settings] [--release] [--program]
$ meteor create [--release <release>] <name> [--example] [--list]
$ meteor update [--release <release>]
$ meteor add <package> [package] [package..]
$ meteor remove <package> [package] [package..]
$ meteor list [--using]
$ meteor bundle <output_file.tar.gz> [--debug]
$ meteor mongo [--url] [site]
$ meteor reset
$ meteor deploy <site> [--settings settings.json] [--debug] [--delete] [--star]
$ meteor logs <site>
$ meteor authorized <site> [--list] [--add <username>] [--remove <username>]
$ meteor claim <site>
$ meteor login [--email]
$ meteor logout
$ meteor whoami
$ meteor test-packages [--release <release>] [--port] [--deploy] [--production] [--settings] [package...]
