import { TextProps } from '@suite-native/atoms';
import { TokenSymbol } from '@suite-common/wallet-types';
import { localizeNumber } from '@suite-common/wallet-utils';

import { FormatterProps } from '../types';
import { AmountText } from './AmountText';
import { convertTokenValueToDecimal } from '../utils';

type TokenAmountFormatterProps = {
    tokenSymbol: TokenSymbol | null;
    isDiscreetText?: boolean;
    decimals?: number;
    isForcedDiscreetMode?: boolean;
} & FormatterProps<number | string> &
    TextProps;

export const TokenAmountFormatter = ({
    value,
    tokenSymbol,
    isDiscreetText = true,
    decimals = 0,
    variant = 'hint',
    color = 'textSubdued',
    ...rest
}: TokenAmountFormatterProps) => {
    const decimalValue = convertTokenValueToDecimal(value, decimals);

    const formattedValue = `${localizeNumber(decimalValue)} ${tokenSymbol}`;

    return (
        <AmountText
            value={formattedValue}
            isDiscreetText={isDiscreetText}
            variant={variant}
            color={color}
            {...rest}
        />
    );
};
