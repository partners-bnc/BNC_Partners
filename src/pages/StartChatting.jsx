import Header from '../Component/Header';
import StartChattingSection from '../Component/StartChattingSection';

const StartChatting = () => (
  <div className="min-h-screen bg-white flex flex-col overflow-x-hidden" style={{ fontFamily: 'Geist, Poppins, sans-serif' }}>
    <Header />
    <StartChattingSection />
  </div>
);

export default StartChatting;
