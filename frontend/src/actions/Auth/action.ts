import { AppAction } from "../../store/state";
import { AuthActionTypes } from "./actionType";
import { ActionModel, LoginType, RegisterType } from "./model";
import { AuthApi } from "./api";
import axios from '../../AxiosConfig';
import { EModal } from "../../Utils/Errors/Modal";
export const AuthActions = {

    //open or close login modal 
    toggleLoginModal: (open: boolean): AppAction<ActionModel> => (dispatch, getState) => {
        dispatch({ type: AuthActionTypes.LoginModal, open  });
    },

    //send request to server
    registerRequest: (data: RegisterType): AppAction<ActionModel> => async (dispatch, getState) => {
        dispatch({type: AuthActionTypes.Login})
        try {
            const res = await AuthApi.register(data)
            if(res.data){
                //login was succeed
                //save token on loacalStorage
                const loginData:LoginType = {email: data.email, password: data.password}
                AuthActions.loginRequest(loginData)(dispatch, getState)
                dispatch({type: AuthActionTypes.LoginSuccess})
            }
        } catch (error) {
            //loagin perosses faild
            dispatch({type: AuthActionTypes.LoginFail})
            EModal(error)
        }
        
    },

    //send request to server
    loginRequest: (data: LoginType): AppAction<ActionModel> => async (dispatch, getState) => {
        dispatch({type: AuthActionTypes.Login})
        try {
            const res = await AuthApi.login(data)
            if(res.data){
                //login was succeed
                //save token on loacalStorage
                window.localStorage.setItem("Nili", `Bearer ${res.data.token}`);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}` 
                dispatch({type: AuthActionTypes.LoginSuccess})
            }
        } catch (error) {
            //loagin perosses faild
            dispatch({type: AuthActionTypes.LoginFail})
                EModal(error)
        }
        
    },


    logOutRequest: (): AppAction<ActionModel> => (dispatch, getState) => {
        //remove token from storage and axios header
        axios.defaults.headers.common['Authorization'] = "" 
        window.localStorage.removeItem("Nili");
        dispatch({type: AuthActionTypes.LogOut});
    }
};
