import "./Modal.css";

const Modal = ({ children, show, header="header", canClose=true }) => (
    <div className="modal" onMouseDown={(e) => canClose && e.currentTarget === e.target ? show(false) : null}>
        
        <div className="modalBody">
        <header className="modalHeader">{ header } <span className="closeSpan" onClick={()=>canClose && show(false)}>&times;</span></header>
            <div className="modalContent">
            { children }
            </div>
        </div>
    </div>
)

export default Modal;