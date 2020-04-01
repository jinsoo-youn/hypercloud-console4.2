import React, { Component, useState } from 'react';
import * as _ from 'lodash-es';
import { Link } from 'react-router-dom';
import * as hyperCloudLogoImg from '../imgs/gnb_logo_circle.svg';
// import { FLAGS, connectToFlags, flagPending } from '../features';
import { FLAGS, connectToFlags } from '../features';
import { authSvc } from '../module/auth';
import { Dropdown, ActionsMenu } from './utils';
import { coFetchJSON } from '../co-fetch';
import { SafetyFirst } from './safety-first';
// import LoginComponent from './login';
import { ExtendSessionModal_ } from './modals/extend-session-modal';

const developerConsoleURL = window.SERVER_FLAGS.developerConsoleURL;
const releaseModeFlag = window.SERVER_FLAGS.releaseModeFlag;

const UserMenu = ({username, actions}) => {
  const title = <React.Fragment>
    <i className="pficon pficon-user co-masthead__user-icon" aria-hidden="true"></i>
    <span className="co-masthead__username">{username}</span>
  </React.Fragment>;
  if (_.isEmpty(actions)) {
    return title;
  }

  return <ActionsMenu actions={actions}
    title={title}
    noButton={true} />;
};

const UserMenuWrapper = connectToFlags(FLAGS.AUTH_ENABLED, FLAGS.OPENSHIFT)((props) => {
  
  // if (flagPending(props.flags[FLAGS.OPENSHIFT]) || flagPending(props.flags[FLAGS.AUTH_ENABLED])) {
  //   return null;
  // }

  const actions = [];
  // if (props.flags[FLAGS.AUTH_ENABLED]) {
  //   const logout = e => {
  //     e.preventDefault();
  //     if (props.flags[FLAGS.OPENSHIFT]) {
  //       authSvc.deleteOpenShiftToken().then(() => authSvc.logout());
  //     } else {
  //       authSvc.logout();
  //     }
  //   };
    // actions.push({
    //   label: 'Logout',
    //   callback: logout
    // });
  // }
  const logout = e => {
    e.preventDefault();
    
    // TODO 로그아웃 api 연동
    const AUTH_SERVER_URL = `${document.location.origin}/api/hypercloud/logout`;
    
    const json = {
      'accessToken': localStorage.getItem('accessToken')
    };
      
    coFetchJSON.post(AUTH_SERVER_URL, json)
      .then(data => {
        localStorage.clear();
        localStorage.setItem('logouted', 'true');
        
        // const url_ = window.location.href.split('/')[2]
        window.location.href = `${document.location.origin}`;
      })
      .catch(error => {
        console.log(error);
      });
  };
  actions.push({
    label: 'Logout',
    callback: logout
  });

  // if (props.flags[FLAGS.OPENSHIFT]) {
    return <OSUserMenu actions={actions} />;
  // }

  actions.unshift({
    label: 'My Account',
    href: '/settings/profile'
  });

  return authSvc.userID() ? <UserMenu actions={actions} username={authSvc.name()} /> : null;
});

export class OSUserMenu extends SafetyFirst {
  constructor(props) {
    super(props);
    this.state = {
      username: undefined
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this._getUserInfo();
  }

  _getUserInfo() {
    // TODO 유저 정보 조회 서비스 연동 
    if (window.SERVER_FLAGS.releaseModeFlag && window.localStorage.getItem('refreshToken') && window.localStorage.getItem('accessToken')) {
      const userRole = JSON.parse(atob(window.localStorage.getItem('accessToken').split('.')[1])).role;
      if (userRole !== 'cluster-admin') {
        this.setState({username: '사용자'});
      } else {
        this.setState({username: '관리자'});
      }
    } else {
      this.setState({username: '사용자'});
    }

    // coFetchJSON('api/kubernetes/apis/user.openshift.io/v1/users/~')
    //   .then((user) => {
    //     this.setState({ username: _.get(user, 'fullName') || user.metadata.name });
    //   }).catch(() => this.setState({ username: null }));
  }

  render () {
    const username = this.state.username;
    return username ? <UserMenu actions={this.props.actions} username={username} /> : null;
  }
}

const ContextSwitcher = () => {
  const items = {
    [`${developerConsoleURL}catalog`]: 'Service Catalog',
    [`${developerConsoleURL}projects`]: 'Application Console',
    [window.SERVER_FLAGS.basePath]: 'Cluster Console'
  };

  return <div className="contextselector-pf">
    <Dropdown title="Cluster Console" items={items} selectedKey={window.SERVER_FLAGS.basePath}
      dropDownClassName="bootstrap-select btn-group" onChange={url => window.location.href = url} />
  </div>;
};

export const LogoImage = () => {
  let logoImg = hyperCloudLogoImg; 
  let logoAlt = 'HyperCloud';

  // Webpack won't bundle these images if we don't directly reference them, hence the switch
  
  return <div className="co-masthead__logo">
    <Link to="/" className="co-masthead__logo-link"><img src={logoImg} alt={logoAlt} /></Link>
  </div>;
};

let timerID = 0;
let expTime = 0;

export class ExpTimer extends Component {
  
  
  state = {
    expMin: '',
    expSec: ''
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (window.localStorage.getItem('accessToken')) {
      const curTime = new Date();
      const tokenExpTime = new Date(JSON.parse(atob(window.localStorage.getItem('accessToken').split('.')[1])).exp * 1000);
      
      const logoutTime = (tokenExpTime.getTime() - curTime.getTime())/1000;
      if (logoutTime < 0) {
        localStorage.clear();
        localStorage.setItem('logouted', 'true');
        window.location.href = `${document.location.origin}`;
      } 

      expTime = logoutTime;
      timerID = window.setInterval(() => this.tick(), 1000);
    } else {
      return;
    }
  }

  tokRefresh() {
    const curTime = new Date();
      const tokenExpTime = new Date(JSON.parse(atob(window.localStorage.getItem('accessToken').split('.')[1])).exp * 1000);
      
      const logoutTime = (tokenExpTime.getTime() - curTime.getTime())/1000;
      if (logoutTime < 0) {
        localStorage.clear();
        localStorage.setItem('logouted', 'true');
        window.location.href = `${document.location.origin}`;
      } 

      expTime = logoutTime;
  }

  componentDidUpdate() {
    // console.log('ExpTimer componentDidUpdate');
    if (!window.localStorage.getItem('accessToken') || !window.localStorage.getItem('refreshToken')) {
        localStorage.clear();
        localStorage.setItem('logouted', 'true');
        window.location.href = `${document.location.origin}`;
    } 
  }

  componentWillUnmount() {
    // 타이머 등록 해제
    window.clearInterval(timerID);
  }

  numFormat(num) {
    var val = Number(num).toString(); 
    if(num < 10 && val.length == 1) {
      val = '0' + val;
    }
    return val;
  }

  tick() {
    expTime -= 1;
    // Test 용으로 짝수 분에 튕기도록 
    if (expTime === 0 || expTime < 0 /*|| Math.floor(expTime / 60 % 2) === 0*/) {
      localStorage.clear();
      localStorage.setItem('logouted', 'true');
      window.location.href = `${document.location.origin}`;
    }
    // console.log(Math.floor(expTime / 60) + " Min " + Math.floor(expTime % 60) + " Sec");
    this.setState({expMin: this.numFormat(Math.floor(expTime / 60))});
    this.setState({expSec: this.numFormat(Math.floor(expTime % 60))});
  }

  render() {
    const {expMin, expSec} = this.state;
    return(
      <div className="exp-timer">
        <i className="fa fa-clock-o" aria-hidden="true"></i>
        <span className="co-masthead__timer__span">
          <span>{expMin}</span>
          :
          <span>{expSec}</span>
        </span>
      </div>
    );  
  }
}

export const Masthead = () => {
  let timerRef = null;
  const [tokenTime, setTokenTime] = useState(60);

  const setExpireTime = (time) => {
    setTokenTime(time);
  }

  const tokenRefresh = () => {
    const AUTH_SERVER_URL = `${document.location.origin}/api/hypercloud/refresh`;
      const json = {
        'accessToken': window.localStorage.getItem('accessToken'),
        'refreshToken': window.localStorage.getItem('refreshToken'),
        'atExpireTime': Number(tokenTime) // Number 
      };
      
      coFetchJSON.post(AUTH_SERVER_URL, json)
        .then(data => {
          // console.log(data);
          if (data.accessToken) {
            window.localStorage.setItem('accessToken', data.accessToken);
            timerRef.tokRefresh();
            return;
          } else {
            return;
          }
        })
        .catch(error => {
          console.log(error);
        });
  }

  return(
    <header role="banner" className="co-masthead">
      <LogoImage />
        {developerConsoleURL && <div className="co-masthead__console-picker">
          <ContextSwitcher />
      </div>}
      {releaseModeFlag && <div className="co-masthead__timer">
        <ExpTimer ref={(input) => { timerRef = input; }} />
      </div>}
      {releaseModeFlag && <div className="co-masthead__expire">
        <button className="btn btn-token-refresh" id="token-refresh" onClick={tokenRefresh}>시간 연장</button>
        <i className="fa fa-cog extend-refresh-icon" onClick={() => ExtendSessionModal_({setExpireTimeFunc: setExpireTime})}></i>
        <div className="extend-refresh-border">
        </div>
      </div>}
      {releaseModeFlag && <div className="co-masthead__user">
        <UserMenuWrapper />
      </div>}
    </header>
  );
}
