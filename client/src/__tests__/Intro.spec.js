import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import * as firebase from 'firebase/app';
import 'firebase/auth'; // for authentication
import 'firebase/storage'; // for storage
import 'firebase/database'; // for realtime database
import 'firebase/firestore'; // for cloud firestore
import 'firebase/messaging'; // for cloud messaging
import 'firebase/functions'; // for cloud functions

import Intro from './../screens/Intro';
import IntroForms from './../components/IntroForms';

Enzyme.configure({ adapter: new Adapter() });

//  having an issue mocking firebase
jest.mock('firebase', () => {
  const auth = jest.fn();
  const mAuth = { signInWithPopup: jest.fn() };
  // @ts-ignore
  auth.GoogleAuthProvider = jest.fn();
  // @ts-ignore
  auth.Auth = jest.fn(() => mAuth);
  return { auth };
});

describe('<Intro />', () => {
  it('renders 1 <Introforms /> components', () => {
    const wrapper = shallow(<Intro />);
    expect(wrapper.find(IntroForms)).to.have.lengthOf(1);
  });
});
