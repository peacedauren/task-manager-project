import type {ReactNode} from 'react';
import './Modal.scss';
import Backdrop from '../Backdrop/Backdrop';
import { IoCloseSharp } from "react-icons/io5";

type Props = {
    children: ReactNode;
    show: boolean;
    onCloseModal: VoidFunction;
    title: string;
}

const Modal = ({children, show, onCloseModal, title}: Props) => {
   return (
        <>
            <Backdrop show={show}/>
            <div className="Modal" style={{transform: show ? "translateY(0)" : "translateY(-200vh)"}}>
                    <div className="title">
                        <div className="title-name">{title}</div>
                        <button className='close' onClick={onCloseModal}><IoCloseSharp /></button>
                    </div>
                {children}
            </div>
        </>
   )
}

export default Modal;