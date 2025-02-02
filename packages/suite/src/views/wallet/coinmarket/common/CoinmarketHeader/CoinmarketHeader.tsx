import styled from 'styled-components';

import { H2 } from '@trezor/components';
import { spacingsPx } from '@trezor/theme';
import { SCREEN_QUERY } from '@trezor/components/src/config/variables';

import { Translation } from 'src/components/suite';
import { ExtendedMessageDescriptor } from 'src/types/suite';
import { INVITY_API_RELOAD_QUOTES_AFTER_SECONDS } from 'src/constants/wallet/coinmarket/metadata';
import {
    getCryptoQuoteAmountProps,
    isCoinmarketExchangeContext,
} from 'src/utils/wallet/coinmarket/coinmarketTypingUtils';
import { CoinmarketHeaderSummary } from 'src/views/wallet/coinmarket/common/CoinmarketHeader/CoinmarketHeaderSummary';
import { CoinmarketRefreshTime } from 'src/views/wallet/coinmarket/common';
import { CoinmarketHeaderFilter } from 'src/views/wallet/coinmarket/common/CoinmarketHeader/CoinmarketHeaderFilter';
import { useCoinmarketFormContext } from 'src/hooks/wallet/coinmarket/form/useCoinmarketCommonForm';

const Header = styled.div`
    padding-top: ${spacingsPx.sm};
    padding-bottom: ${spacingsPx.xs};
`;

const HeaderTop = styled.div`
    margin-bottom: ${spacingsPx.xl};
`;

const HeaderBottom = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-top: ${spacingsPx.xl};

    ${SCREEN_QUERY.BELOW_TABLET} {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const HeaderCoinmarketRefreshTime = styled.div`
    margin-left: auto;
    padding: ${spacingsPx.xxs} 0 ${spacingsPx.xxs} ${spacingsPx.lg};

    ${SCREEN_QUERY.MOBILE} {
        order: -2;
        margin-left: 0;
        padding: ${spacingsPx.xxs} 0;
    }
`;

const CoinmarketHeaderSummaryWrap = styled(CoinmarketHeaderSummary)`
    ${SCREEN_QUERY.BELOW_TABLET} {
        order: -1;
    }
`;

interface CoinmarketHeaderProps {
    title: ExtendedMessageDescriptor['id'];
    titleTimer: ExtendedMessageDescriptor['id'];
}

export const CoinmarketHeader = ({ title, titleTimer }: CoinmarketHeaderProps) => {
    const context = useCoinmarketFormContext();
    const { timer, quotes } = context;
    const headerProps = getCryptoQuoteAmountProps(quotes?.[0], context);

    return (
        <Header>
            <HeaderTop>
                <H2>
                    <Translation id={title} />
                </H2>
            </HeaderTop>
            {headerProps && isCoinmarketExchangeContext(context) && (
                <CoinmarketHeaderSummaryWrap {...headerProps} />
            )}
            <HeaderBottom>
                <CoinmarketHeaderFilter />
                <HeaderCoinmarketRefreshTime>
                    <CoinmarketRefreshTime
                        isLoading={timer.isLoading}
                        refetchInterval={INVITY_API_RELOAD_QUOTES_AFTER_SECONDS}
                        seconds={timer.timeSpend.seconds}
                        label={<Translation id={titleTimer} />}
                    />
                </HeaderCoinmarketRefreshTime>
            </HeaderBottom>
        </Header>
    );
};
