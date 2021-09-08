import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import firebase from '../firebase';

import Intro from './../screens/Intro';
import IntroForms from './../components/IntroForms';
import { authMock, firebaseConfig } from './setupTests';

Enzyme.configure({ adapter: new Adapter() });

firebase.auth = authMock;
//  having an issue mocking firebase
// jest.mock('firebase', () => {
//   const auth = jest.fn();
//   const mAuth = { signInWithPopup: jest.fn() };
//   // @ts-ignore
//   auth.GoogleAuthProvider = jest.fn();
//   // @ts-ignore
//   auth.Auth = jest.fn(() => mAuth);
//   return { auth };
// });

describe('<Intro />', () => {
  it('renders 1 <Introforms /> components', () => {
    const wrapper = shallow(<Intro />);
    expect(wrapper.find(IntroForms)).to.have.lengthOf(1);
  });
});
