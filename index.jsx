import React, {useState, useEffect, useRef} from 'react'
import ReactDOM from 'react-dom'

const EasingFunctions = {
    // no easing, no acceleration
    linear: t => t,
    // accelerating from zero velocity
    easeInQuad: t => t*t,
    // decelerating to zero velocity
    easeOutQuad: t => t*(2-t),
    // acceleration until halfway, then deceleration
    easeInOutQuad: t => t<.5 ? 2*t*t : -1+(4-2*t)*t,
    // accelerating from zero velocity 
    easeInCubic: t => t*t*t,
    // decelerating to zero velocity 
    easeOutCubic: t => (--t)*t*t+1,
    // acceleration until halfway, then deceleration 
    easeInOutCubic: t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
    // accelerating from zero velocity 
    easeInQuart: t => t*t*t*t,
    // decelerating to zero velocity 
    easeOutQuart: t => 1-(--t)*t*t*t,
    // acceleration until halfway, then deceleration
    easeInOutQuart: t => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,
    // accelerating from zero velocity
    easeInQuint: t => t*t*t*t*t,
    // decelerating to zero velocity
    easeOutQuint: t => 1+(--t)*t*t*t*t,
    // acceleration until halfway, then deceleration 
    easeInOutQuint: t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t
  }

const Chart = props => {
  const [pointerDefault, circleDefault] = [{initial: true, current: []}, {overed: false, data: []}]
  let [circle, setCircle] = useState(() => circleDefault)
  let [pointer, setPointer] = useState(() => pointerDefault)
  let [circleDX, circleDY] = [0, 0]
  if ((typeof pointer.initial) == 'object') {
      circleDX = pointer.current[0] -pointer.initial[0]
      circleDY = pointer.current[1] - pointer.initial[1]
  }
  const [circleInfoBoxX, circleInfoBoxY, circleOffsetX, circleOffsetY] = [
      parseInt(circle.data[0]) + circleDX,
      parseInt(circle.data[1]) + circleDY, -35, 0]
  const circleMouseOverHandler = event => {
      setCircle({overed: true, data: [event.target.getAttribute('cx'), event.target.getAttribute('cy')]})
  }
  const circleMouseOutHandler = event => {
      setCircle(circleDefault)
      setPointer(pointerDefault)
  }
  const circleMouseMoveHandler = event => {
    const [px, py] = [event.pageX, event.pageY]
      if (true === pointer.initial) {
        setPointer({initial: [px, py], current: [px, py]})
      }
      else setPointer(Object.assign({}, pointer, {current: [px, py]}))
  }
  const circles = props.dots.map((dot, idx) => {
      return (<circle key={idx} cx={dot[0]} cy={dot[1]} r="5" onMouseMove={circleMouseMoveHandler} onMouseOver={circleMouseOverHandler} onMouseOut={circleMouseOutHandler} />)
  })
  const lines = () => {
      const style = {stroke: 'rgb(0, 0, 0)', strokeWidth: 2}
      const lines_ = []
      for (let i = 0; i < props.dots.length - 1; i++) {
          lines_[lines_.length] = (
            <line key={100 + i} x1={props.dots[i][0]} y1={props.dots[i][1]} x2={props.dots[i + 1][0]} y2={props.dots[i + 1][1]} style={style} />
          )
      }
      return lines_
  }
  const defineHighestY = () => {
      const dots = props.dots
      let highest = dots[0][1]
      for (let p = 1; p < dots.length; p++) {
          if (dots[p][1] > highest) {
            highest = dots[p][1]
          }
      }
      return highest
  }
  const highestY = defineHighestY()
  const highestYPlus = highestY + 10
  const ch = ','
  const polygons = () => {
      const style = {fill: 'rgba(160, 160, 160, .4)', strokeWidth: 0}
      const polygons_ = []
      for (let i = 0; i < props.dots.length - 1; i++) {
          const [pointAx, pointAy, pointBx, pointBy, pointCx, pointCy, pointDx, pointDy] = [
              props.dots[i][0],
              props.dots[i][1],
              props.dots[i][0],
              highestYPlus,
              props.dots[i + 1][0],
              highestYPlus,
              props.dots[i + 1][0],
              props.dots[i + 1][1]
          ]
          const points = [pointAx + ch + pointAy, pointBx + ch + pointBy, pointCx + ch + pointCy, pointDx + ch + pointDy].join(' ')
          polygons_[polygons_.length] = (
              <polygon key={200 + i} points={points} style={style} />
          )
      }
      return polygons_
  }
  const circleBoxStyle = {
      top: `${circleInfoBoxY + circleOffsetY}px`,
      left: `${circleInfoBoxX + circleOffsetX}px`
  }
  const circleInfoBox = (<div className={'circleInfoBox visible'} style={circleBoxStyle}>{circle.data[0] + ch + circle.data[1]}</div>)
  return (
    <div>
        {circle.overed ? circleInfoBox : ''}
        <svg xmlns="http://www.w3.org/2000/svg" width="950" height="950">
          {polygons()}{lines()}{circles}
        </svg>
    </div>
  )
}

const AnimatedChart = props => {
    const [dots, updateDots] = useState(props.dotsA)
    const initialTime = useRef(+new Date)
    const requestRef = React.useRef()
    const duration = 1000
    const animationFunction = time => {
        let dx = (+new Date - initialTime.current) / duration
        const render = (dx, props) => {
            let computedDots_ = []
            for (let i = 0; i < props.dotsA.length; i++) {
                computedDots_[computedDots_.length] = [props.dotsB[i][0], props.dotsA[i][1] + (props.dotsB[i][1] - props.dotsA[i][1]) * EasingFunctions.easeInOutQuint(dx) ]
            }
            updateDots(computedDots_)
        }
        if (dx >= 1) render(1, props)
        else {
            render(dx, props)
            requestRef.current = requestAnimationFrame(animationFunction)
        }
    }
    useEffect(() => {
        requestRef.current = requestAnimationFrame(animationFunction)
        return () => cancelAnimationFrame(requestRef.current)
    }, [])
    return (<Chart dots={dots} />)
}
ReactDOM.render(<AnimatedChart dotsA={[[10, 10], [60, 17], [110, 10], [160, 78], [210, 100], [260, 10]]} dotsB={[[10, 40], [60, 7], [110, 57], [160, 13], [210, 166], [260, 0]]} />, document.getElementById('reactapp'))