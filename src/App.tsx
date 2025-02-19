import reactLogo from './assets/react.svg'

import DraggableFloatingIcon from './components/draggable-floating-icon'

function App() {
  return (
    <>
      <h2>Draggable Floating Icon</h2>
      <DraggableFloatingIcon
        customClass="draggable-floating"
        showFullSizeOpt={true}
      >
        <img src={reactLogo} alt="React Logo" />
      </DraggableFloatingIcon>
    </>
  )
}

export default App
