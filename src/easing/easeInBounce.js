import easeOutBounce from './easeOutBounce';

export default function easeInBounce( t, b, c, d ) {
    return c - easeOutBounce(d - t, 0, c, d) + b;
}
