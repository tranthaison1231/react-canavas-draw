import { useCallback, useRef, useState } from 'react';

function App() {
  const [isDrawing, setIsDrawing] = useState(false)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const setCanvasRef = useCallback((element: HTMLCanvasElement) => {
    element.width = window.innerWidth;
    element.height = window.innerHeight;

    const context = element.getContext("2d")
    if(context) {
      context.lineCap = "round";
      context.strokeStyle = "black";
      context.lineWidth = 5;
      contextRef.current = context;
    }
  }, []);

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    if (contextRef.current) {
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    }
  };

  const clearCanvas = () => {
    if(contextRef.current){
      contextRef.current.fillStyle = "white"
      contextRef.current.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  return (
    <>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        ref={setCanvasRef}
      />
      <button onClick={clearCanvas}>Clear</button>
    </>
  )
}

export default App
