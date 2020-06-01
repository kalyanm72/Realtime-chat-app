import React, {Component} from 'react'
import 'react-toastify/dist/ReactToastify.css'
import style from './WelcomeBoard.module.css'

export default class WelcomeBoard extends Component {
    render() {
        return (
            <div className={style.viewWelcomeBoard}>
        <span className={style.textTitleWelcome}>{`Welcome, ${
            this.props.currentUserNickname
            }`}</span>
                <img
                    className={style.avatarWelcome}
                    src={this.props.currentUserAvatar}
                    alt="icon avatar"
                />
                <span className={style.textDesciptionWelcome}>
                Welcome to Realtime text and video chat hope u find good friends !!
        </span>
            </div>
        )
    }
}
