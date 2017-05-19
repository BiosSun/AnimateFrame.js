export default function easeOutCubic( t, b, c, d ) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
}
