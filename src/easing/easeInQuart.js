export default function easeInQuart( t, b, c, d ) {
    return c * (t /= d) * t * t * t + b;
}
