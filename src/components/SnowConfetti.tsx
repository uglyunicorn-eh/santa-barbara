import TheConfetti from 'react-confetti';

const numPoints = 5;

function drawSnowflake(ctx: CanvasRenderingContext2D) {
  const _radius = Math.random() * 2 + 4;
  const innerRadius = _radius * 0.2
  const outerRadius = _radius * 0.8

  ctx.beginPath()
  ctx.moveTo(0, 0 - outerRadius)

  for (let n = 1; n < numPoints * 2; n++) {
    const radius = n % 2 === 0 ? outerRadius : innerRadius
    const x = radius * Math.sin((n * Math.PI) / numPoints)
    const y = -1 * radius * Math.cos((n * Math.PI) / numPoints)
    ctx.lineTo(x, y)
  }
  ctx.fill()
  ctx.stroke()
  ctx.closePath()
}

export const SnowConfetti = () => (
  <TheConfetti
    drawShape={drawSnowflake}
    colors={['#aee1ff', '#cbddf8', '#ede3b6', '#f4bb9a', '#aed58c']}
    gravity={0.007}
    wind={0.001}
    friction={0.98}
    opacity={0.5}
    initialVelocityY={-20}

    numberOfPieces={70}
    style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
  />
);
