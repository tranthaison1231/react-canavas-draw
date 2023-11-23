import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const socket = io('ws://localhost:1337');

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isDrawing, setIsDrawing] = useState(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const setCanvasRef = useCallback((element: HTMLCanvasElement) => {
    element.width = window.innerWidth;
    element.height = window.innerHeight;

    const context = element.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.strokeStyle = 'black';
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
    socket.emit('send-draw', {
      x: nativeEvent.offsetX,
      y: nativeEvent.offsetY,
    });
    const { offsetX, offsetY } = nativeEvent;
    if (contextRef.current) {
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    }
  };

  const clearCanvas = () => {
    if (contextRef.current) {
      contextRef.current.fillStyle = 'white';
      contextRef.current.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onDraw(nativeEvent: any) {
      const { x, y } = nativeEvent;
      if (contextRef.current) {
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('draw', onDraw);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('draw', onDraw);
    };
  }, []);

  return (
    <>
      <button onClick={() => socket.emit('join', {
        name: 'room1'
      })}>Join Room</button>
      {isConnected ? <p>Connected</p> : <p>Not connected</p>}
      <canvas onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseMove={draw} ref={setCanvasRef} />
      <button onClick={clearCanvas}>Clear</button>
    </>
  );
}

export default App;
