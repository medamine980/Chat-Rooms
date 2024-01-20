import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux";
import { setDBName } from "../../actions";
import IdbHandler from "../../IdbHandler"


const useChatIDB = () => {
    const db = useRef();
    const dispatch = useDispatch();
    const messagesObjectStore = useRef();
    const IDBName = useRef();
    const { name: IDBNameRedux } = useSelector(state => state.IDB)
    useEffect(() => {
        if (!db.current) {
            const id = `Chat-App_${Date.now()}`
            dispatch(setDBName(id))
            IDBName.current = id;
            db.current = new IdbHandler({
                db_name: IDBName.current,
                onOpen: (db) => { messagesObjectStore.current = db.objectStore("messages") },
                schema: {
                    "messages": {
                        user: String,
                        id: String,
                        order: Number,
                        text: String,
                        fileType: String,
                        time: String,
                        fileName: String,
                        blob: Object
                    }
                },
                generateKey: false,
                keyPath: "order"
            })
            window.onbeforeunload = () => { db.current.deleteDB() };
        }

        return () => {
            window.onbeforeunload = () => { };
        }
    }, [dispatch]);
    useEffect(() => {
        return () => {
            if (db.current) db.current.deleteDB();
        }
    }, [])
    return { db: db.current, messagesObjectStore: messagesObjectStore.current };
}
export default useChatIDB;