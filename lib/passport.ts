import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from './models';
import { connectDB } from './db';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        await connectDB();
        
        let user = await User.findOne({ 
          $or: [
            { googleId: profile.id },
            { email: profile.emails?.[0].value }
          ]
        });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails?.[0].value,
            googleId: profile.id,
            role: 'buyer',
            status: 'active'
          });
        } else if (!user.googleId) {
          // Link google id if email matches but google id was missing
          user.googleId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;
