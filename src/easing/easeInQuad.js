export default function easeInQuad( t, b, c, d ) {
    return c * (t /= d) * t + b;
}
