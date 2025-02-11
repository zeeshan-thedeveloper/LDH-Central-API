const passport = require('passport');
const { BACK_END_BASE_URL } = require('../request-manager/urls');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const GithubStrategy = require('passport-github2').Strategy;


// Google Strategy

passport.use(new GoogleStrategy({
    clientID: "1021611673334-buf3dq11lnl5hb17jd5ohbvkhhkgh93d.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL:`${BACK_END_BASE_URL}/google/callback`,
    // callbackURL:"http://localhost:3003/google/callback", //change to above 
    
    passReqToCallback: true,
  },  

  function(request, accessToken, refreshToken, profile, done) {
    return done(null,profile,refreshToken,accessToken);
  }));

  // Github strategy

passport.use(new GithubStrategy({
    clientID: "6984bbc1aa582cb223bd",
    clientSecret: "170b1655619c72d6c55715be308c6f37417751f1",
    callbackURL: `${BACK_END_BASE_URL}/github/callback`
    // callbackURL: "http://localhost:3003/github/callback"  
  },

  function(accessToken, refreshToken, profile, done) {
      return done(null, profile);
  } 
));


passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});
  