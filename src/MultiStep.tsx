import React, { useState, useEffect } from 'react'
import { MultiStepProps, ChildState, MultiStepStyles } from './interfaces'
import { BaseStyles } from './baseStyles'

const getTopNavStyles = (activeStep: number, length: number): string[] => {
  const styles: string[] = []
  for (let i = 0; i < length; i++) {
    i === activeStep ? styles.push('doing') : styles.push('todo')
  }
  return styles
}

const getBottomNavState = (activeStep: number, length: number, stepIsValid: boolean) => {
  return {
    prevDisabled: activeStep === 0,
    nextDisabled: !stepIsValid,
    hideLast: activeStep === length - 1
  }
}

const getFlexDirection = (position: string): 'row' | 'row-reverse' | 'column' | 'column-reverse' => {
  switch (position) {
    case 'left':
      return 'row-reverse'
    case 'right':
      return 'row'
    case 'above':
      return 'column-reverse'
    case 'below':
    default:
      return 'column'
  }
}

export default function MultiStep(props: MultiStepProps) {
  let { children } = props
  if (!children || children.length === 0)
    throw TypeError("Error: Application has no children Components configured")

  const styles: MultiStepStyles = props.styles ?? BaseStyles
  const [activeChild, setActive] = useState(0)
  const [childIsValid, setChildIsValid] = useState(false)
  const [topNavState, setTopNavState] = useState(getTopNavStyles(0, children.length))
  const [bottomNavState, setBottomNavState] = useState(getBottomNavState(0, children.length, false))

  useEffect(() => {
    setTopNavState(getTopNavStyles(activeChild, children.length))
    setBottomNavState(getBottomNavState(activeChild, children.length, childIsValid))
  }, [activeChild, childIsValid, children.length])

  const childStateChanged = (childState: ChildState) => setChildIsValid(childState.isValid)

  children = React.Children.map(children, child =>
    React.cloneElement(child, { signalParent: childStateChanged })
  )

  const handleNext = () => {
    if (props.onNext) props.onNext()
    setActive(prev => (prev < children.length - 1 ? prev + 1 : prev))
  }

  const handlePrevious = () => {
    if (props.onPrev) props.onPrev()
    setActive(prev => (prev > 0 ? prev - 1 : prev))
  }

  const handleStepClick = (i: number) => {
    if (props.disableNavigationClick) return
    if (childIsValid) setActive(i)
  }

  const renderTopNav = () =>
    <ol style={styles.topNav}>
      {children.map((c, i) =>
        <li
          style={styles.topNavStep}
          onClick={() => handleStepClick(i)}
          key={i}
        >
          <div style={{
            display: 'flex',
            flexDirection: getFlexDirection(props.topNavLabelPosition ?? 'below'),
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={topNavState[i] === 'doing' ? styles.doing : styles.todo}>
              {i + 1}
            </div>
            <div style={{ fontSize: '0.8rem' }}>
              {c.props.title ?? `Step ${i + 1}`}
            </div>
          </div>
        </li>
      )}
    </ol>

  const renderBottomNav = () => {
    if (props.showNavigation === false) return null

    return (
      <div style={styles.section}>
        <button
          onClick={handlePrevious}
          style={styles.prevButton}
          disabled={bottomNavState.prevDisabled}
        >
          <span>&#60;</span>
        </button>
        <button
          onClick={handleNext}
          style={bottomNavState.hideLast ? { display: 'none' } : styles.nextButton}
          disabled={bottomNavState.nextDisabled}
        >
          <span>&#62;</span>
        </button>
      </div>
    )
  }

  return (
    <div style={styles.component}>
      {renderTopNav()}
      <div style={styles.section}>
        {children[activeChild]}
      </div>
      {renderBottomNav()}
    </div>
  )
}
