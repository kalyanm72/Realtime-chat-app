import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import {withRouter} from 'react-router-dom'
import {myFirebase, myFirestore} from '../../Config/MyFirebase'
import images from '../Themes/Images'
import WelcomeBoard from '../WelcomeBoard/WelcomeBoard'
import style from './Main.module.css'
import styles from './Searchbox.module.css'
import ChatBoard from './../ChatBoard/ChatBoard'
import {AppString} from './../Const'
import moment from 'moment'
class Main extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            isOpenDialogConfirmLogout: false,
            currentPeerUser: null,
            search:''
        }
        this.currentUserId = localStorage.getItem(AppString.ID)
        this.currentUserAvatar = localStorage.getItem(AppString.PHOTO_URL)
        this.currentUserNickname = localStorage.getItem(AppString.NICKNAME)
        this.listUser = []
    }

    componentDidMount() {
      console.log("mount1");
        this.checkLogin()
    }


    checkLogin = () => {
        if (!localStorage.getItem(AppString.ID)) {
            this.setState({isLoading: false}, () => {
                this.props.history.push('/')
            })
        } else {
            this.getListUser()
        }
    }

    getListUser = async () => {


        const result = await myFirestore.collection(AppString.NODE_USERS).get()
        if (result.docs.length > 0) {
            this.listUser = [...result.docs]
            this.setState({isLoading: false})
        }
    }

    onLogoutClick = () => {
        this.setState({
            isOpenDialogConfirmLogout: true
        })
    }

    doLogout = () => {
      const timestamp = moment.utc().valueOf().toString();
        this.setState({isLoading: true})
        // console.log("culprit1")
        // console.log(timestamp)
        myFirestore
            .collection('users')
            .doc(this.currentUserId)
            .set({
                lastlogout:timestamp
            },{ merge: true })

        myFirebase
            .auth()
            .signOut()
            .then(() => {
                this.setState({isLoading: false}, () => {
                    localStorage.removeItem(AppString.ID)
                    this.props.showToast(1, 'Logout success')
                    this.props.history.push('/')
                })
            })
            .catch(function (err) {
                this.setState({isLoading: false})
                this.props.showToast(0, err.message)
            })
    }

    hideDialogConfirmLogout = () => {
        this.setState({
            isOpenDialogConfirmLogout: false
        })
    }

    onProfileClick = () => {
        this.props.history.push('/profile')
    }
    checker =(props)=>{
      let groupchatid='';
      if (
          this.hashString(this.currentUserId) <=
          this.hashString(props)
      ) {
          groupchatid = `${this.currentUserId}-${props}`
      } else {
          groupchatid = `${props}-${this.currentUserId}`
      }
      let a,b;
      a=groupchatid+this.currentUserId;
      b=groupchatid+props;
      // console.log('b');
      // console.log(localStorage.getItem(b));
      // console.log('a');
      // console.log(localStorage.getItem(a));
      // console.log(a);
      // console.log('   ');
      // console.log(b);
      // console.log('   ');
      // console.log(localStorage.getItem(a));
      // console.log('   ');
      // console.log(localStorage.getItem(b));
        if(localStorage.getItem(a)<localStorage.getItem(b))
        return 'notification-dot';
        if(localStorage.getItem(a)===undefined&&localStorage.getItem(b)!==undefined)
        return 'notification-dot';
        return 'ishidden';
    }
    renderListUser = () => {
        // console.log("hello");
        if (this.listUser.length > 0) {
            let viewListUser = []
            this.listUser.forEach((item, index) => {
                if (item.data().id !== this.currentUserId&& item.data().nickname.toLowerCase().startsWith(this.state.search.toLowerCase())) {

                    viewListUser.push(
                        <button
                            key={index}
                            className={
                                this.state.currentPeerUser &&
                                this.state.currentPeerUser.id === item.data().id
                                    ? style.viewWrapItemFocused
                                    : style.viewWrapItem
                            }
                            onClick={() => {
                                this.setState({currentPeerUser: item.data()})
                            }}
                        >
                            <img
                                className={style.viewAvatarItem}
                                src={item.data().photoUrl}
                                alt="icon avatar"
                            />
                            <div className={style.viewWrapContentItem}>
                    <div className={style.textItem}>
                    <span >{`Nickname: ${
                    item.data().nickname
                    }`}
                    </span>
                    <div className={this.checker(item.data().id)}>
                    </div>
                    </div>
              <span className={style.textItem}>{`About me: ${
                    item.data().aboutMe ? item.data().aboutMe : 'Hi!  i am new to Re-chat'
                    }`}</span>
                            </div>
                        </button>
                    )
                }
            })
            return viewListUser
        } else {
            return null
        }
    }
    hashString = str => {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            hash += Math.pow(str.charCodeAt(i) * 31, str.length - i)
            hash = hash & hash // Convert to 32bit integer
        }
        return hash
    }
    searchhandler = props =>{
        this.setState({search:props.target.value});
        // console.log(localStorage.getItem('search'));
        this.renderListUser();
    }
    render() {
        return (
            <div className={style.root}>
                {/* Header */}
                <div className={style.header}>
                    <span className={style.rechat}>REALTIME TEXT AND VIDEO CHAT</span>
                    <img
                        className={style.icProfile}
                        alt="An icon default avatar"
                        src={images.ic_default_avatar}
                        onClick={this.onProfileClick}
                    />
                    <img
                        className={style.icLogout}
                        alt="An icon logout"
                        src={images.ic_logout}
                        onClick={this.onLogoutClick}
                    />
                </div>

                {/* Body */}
                <div className={style.body}>

                    <div className={style.viewListUser}>
                            <div className={styles.wrap}>
                                <div className={styles.search}>
                                  <input type="text" onChange={this.searchhandler} className={styles.searchTerm} placeholder="Search a friend.."/>
                                </div>
                            </div>
                    {this.renderListUser()}
                    </div>
                    <div className={style.viewBoard}>
                        {this.state.currentPeerUser ? (
                            <ChatBoard
                                currentPeerUser={this.state.currentPeerUser}
                                showToast={this.props.showToast}
                            />
                        ) : (
                            <WelcomeBoard
                                currentUserNickname={this.currentUserNickname}
                                currentUserAvatar={this.currentUserAvatar}
                            />
                        )}
                    </div>
                </div>

                {/* Dialog confirm */}
                {this.state.isOpenDialogConfirmLogout ? (
                    <div className={style.viewCoverScreen}>
                        {this.renderDialogConfirmLogout()}
                    </div>
                ) : null}

                {/* Loading */}
                {this.state.isLoading ? (
                    <div className={style.viewLoading}>
                        <ReactLoading
                            type={'spin'}
                            color={'#203152'}
                            height={'3%'}
                            width={'3%'}
                        />
                    </div>
                ) : null}
            </div>
        )
    }

    renderDialogConfirmLogout = () => {
        return (
            <div>
                <div className={style.viewWrapTextDialogConfirmLogout}>
                    <span className={style.titleDialogConfirmLogout}>Are you sure to logout?</span>
                </div>
                <div className={style.viewWrapButtonDialogConfirmLogout}>
                    <button className={style.btnYes} onClick={this.doLogout}>
                        YES
                    </button>
                    <button className={style.btnNo} onClick={this.hideDialogConfirmLogout}>
                        CANCEL
                    </button>
                </div>
            </div>
        )
    }
}

export default withRouter(Main)
