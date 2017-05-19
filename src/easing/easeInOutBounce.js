import easeInBounce from './easeInBounce';
import easeOutBounce from './easeOutBounce';

export default function easeInOutBounce( t, b, c, d ) {
    if (t < d / 2) {
        return easeInBounce(t * 2, 0, c, d) * .5 + b;
    }

    return easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
}
