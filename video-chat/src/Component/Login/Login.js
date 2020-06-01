import firebase from 'firebase'
import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import {withRouter,Link} from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import {myFirebase, myFirestore} from '../../Config/MyFirebase'
import  style from './Login.module.css'
import {AppString} from './../Const'
import moment from 'moment'

class Login extends Component {
    constructor(props) {
        super(props)
        this.provider = new firebase.auth.GoogleAuthProvider()
        this.state = {
            isLoading: true
        }
    }

    componentDidMount() {
        this.checkLogin()
    }

    checkLogin = () => {
        if (localStorage.getItem(AppString.ID)) {
            this.setState({isLoading: false}, () => {
                this.setState({isLoading: false})
                this.props.showToast(1, 'Login success')
                this.props.history.push('/main')
            })
        } else {
            this.setState({isLoading: false})
        }
    }

    onLoginPress = () => {
        this.setState({isLoading: true})
        myFirebase
            .auth()
            .signInWithPopup(this.provider)
            .then(async result => {
                let user = result.user
                if (user) {
                    const result = await myFirestore
                        .collection(AppString.NODE_USERS)
                        .where(AppString.ID, '==', user.uid)
                        .get()
                        const timestamp = moment.utc().valueOf().toString();
                    if (result.docs.length === 0) {
                        // Set new data since this is a new user
                        myFirestore
                            .collection('users')
                            .doc(user.uid)
                            .set({
                                id: user.uid,
                                nickname: user.displayName,
                                aboutMe: '',
                                photoUrl: user.photoURL,
                                lastlogin:timestamp,
                                lastlogout:''
                            })
                            .then(data => {
                                // Write user info to local
                                localStorage.setItem(AppString.ID, user.uid)
                                localStorage.setItem(AppString.NICKNAME, user.displayName)
                                localStorage.setItem(AppString.PHOTO_URL, user.photoURL)
                                localStorage.setItem('lastlogin',timestamp)
                                this.setState({isLoading: false}, () => {
                                    this.props.showToast(1, 'Login success')
                                    this.props.history.push('/main')
                                })
                            })
                    } else {
                        // Write user info to local
                        console.log("yes1")
                        console.log(timestamp)
                        localStorage.setItem(AppString.ID, result.docs[0].data().id)
                        localStorage.setItem(
                            AppString.NICKNAME,
                            result.docs[0].data().nickname
                        )
                        localStorage.setItem(
                            AppString.PHOTO_URL,
                            result.docs[0].data().photoUrl
                        )
                        localStorage.setItem(
                            AppString.ABOUT_ME,
                            result.docs[0].data().aboutMe
                        )
                        localStorage.setItem(
                            AppString.LASTLOGIN,timestamp
                        )
                        localStorage.setItem(
                          AppString.LASTLOGOUT,
                            result.docs[0].data().lastlogout
                        )
                        this.setState({isLoading: false}, () => {
                            this.props.showToast(1, 'Login success')
                            this.props.history.push('/main')
                        })
                    }
                } else {
                    this.props.showToast(0, 'User info not available')
                }
            })
            .catch(err => {
                this.props.showToast(0, err.message)
                this.setState({isLoading: false})
            })
    }

    render() {
        return (
          <div className={style.background}>
            <div className={style.viewRoot}>
                    <div className={style.header}>REALTIME TEXT AND VIDEO CHAT</div>
                <button className={style.btnLogin} type="submit" onClick={this.onLoginPress}>
                    SIGN IN WITH GOOGLE
                </button>
                <div>
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
             </div>
          </div>
        )
    }
}

export default withRouter(Login)
