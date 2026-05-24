import NotificationRoot from '../components/Notification.jsx';
import Navbar      from '../components/Navbar.jsx';
import Hero        from '../components/Hero.jsx';
import InviteeName from '../components/InviteeName.jsx';
import Ceremony    from '../components/Ceremony.jsx';
import Reception   from '../components/Reception.jsx';
import Countdown   from '../components/Countdown.jsx';
import RSVP        from '../components/RSVP.jsx';
import Gifts       from '../components/Gifts.jsx';
import DressCode   from '../components/DressCode.jsx';
import Footer      from '../components/Footer.jsx';

export default function Home() {
  return (
    <>
      <NotificationRoot />
      <Navbar />
      <main>
        <Hero />
        <InviteeName />
        <DressCode />
        <Ceremony />
        <Reception />
        <Countdown />
        <RSVP />
        <Gifts />
      </main>
      <Footer />
    </>
  );
}
