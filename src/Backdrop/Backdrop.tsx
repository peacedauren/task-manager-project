import './Backdrop.scss'

type TProps = {
    show: boolean;
}

const Backdrop = ({show}: TProps) => {
    return(
        <div className="Backdrop" style={{display: show ? "block" : "none"}}></div>
    )
}

export default Backdrop;