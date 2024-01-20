import './ScrollToBottom.css';
import React, { useEffect, useState } from 'react';
import downArrow from './../../images/expand-arrow.png'

const ScrollToBottom = React.memo(({ children, scrollBack, isAtBottom, isAtTop, messages }) => {
  const childrenRef = React.useRef(null);
  const [readyToScroll, setReadyToScroll] = useState(true);
  const scrollToBottom = () => {
    if (!childrenRef.current) return
    childrenRef.current.scrollTo(0, childrenRef.current.scrollHeight - childrenRef.current.clientHeight)
  }
  useEffect(() => {
    scrollBack.current = (height) => {
      if (childrenRef.current) {
        childrenRef.current.scrollTo(0, height)
      }
    }
  }, [scrollBack])
  useEffect(() => {
    isAtBottom.current = readyToScroll;
    if (readyToScroll) scrollToBottom()
  }, [messages, readyToScroll, isAtBottom])
  useEffect(() => {
    if (!childrenRef.current) return
    childrenRef.current.addEventListener("scroll", e => {
      let element = childrenRef.current;
      if (!element) return
      setReadyToScroll(Math.ceil(element.scrollTop + element.clientHeight) >= element.scrollHeight);
      isAtTop.current = childrenRef.current.scrollTop === 0;
    });


  }, [childrenRef])
  return (
    <div className="scrollToBottomContainer">
      {/* {React.Children.map(children, (child, index) =>
          React.cloneElement(child, {
            ref: (ref) => (childrenRef.current[index] = ref)
          })
        )} */}
      <div
        ref={childrenRef} className="scrollToBottomScroller">
        {
          children
        }
      </div>
      {
        !readyToScroll &&
        <button className="scrollToBottomButton" onClick={scrollToBottom}>
          <img src={downArrow} width={"100%"} alt="down arrow" />
        </button>
      }
    </div>
  )
})

export default ScrollToBottom;