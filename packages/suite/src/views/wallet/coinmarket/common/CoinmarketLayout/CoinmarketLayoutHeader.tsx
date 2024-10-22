import { IconButton, Row } from '@trezor/components';
import { spacings } from '@trezor/theme';
import { PropsWithChildren, useCallback, useMemo } from 'react';
import { goto } from 'src/actions/suite/routerActions';
import { PageHeader } from 'src/components/suite/layouts/SuiteLayout';
import { BasicName } from 'src/components/suite/layouts/SuiteLayout/PageHeader/PageNames/BasicName';
import { useDispatch, useLayout, useSelector, useTranslation } from 'src/hooks/suite';
import { useCoinmarketRouteHelper } from 'src/hooks/wallet/coinmarket/useCoinmarketRouteHelper';
import type { CoinmarketContainerCommonProps } from 'src/types/coinmarket/coinmarket';
import { CoinmarketLayoutNavigationItem } from 'src/views/wallet/coinmarket/common/CoinmarketLayout/CoinmarketLayoutNavigation/CoinmarketLayoutNavigationItem';

interface CoinmarketLayoutHeaderProps extends PropsWithChildren, CoinmarketContainerCommonProps {}

/**
 * @backRoute when is not provided, it will be used route from global coinmarket state
 * check `useCoinmarketRouteHelper` for more details
 */
export const CoinmarketLayoutHeader = ({
    title,
    backRoute,
    children,
}: CoinmarketLayoutHeaderProps) => {
    const selectedAccount = useSelector(state => state.wallet.selectedAccount);
    const { translationString } = useTranslation();
    const dispatch = useDispatch();
    const fallbackTitle = useMemo(() => title || 'TR_NAV_TRADE', [title]);

    const translatedTitle = translationString(fallbackTitle);
    const pageTitle = `Trezor Suite | ${translatedTitle}`;

    const { updatedBackRoute, currentRouteName } = useCoinmarketRouteHelper({ backRoute });

    const handleBackClick = useCallback(() => {
        if (selectedAccount.status === 'loaded') {
            dispatch(
                goto(updatedBackRoute, {
                    params: {
                        symbol: selectedAccount.account.symbol,
                        accountIndex: selectedAccount.account.index,
                        accountType: selectedAccount.account.accountType,
                    },
                }),
            );

            return;
        }

        dispatch(goto(updatedBackRoute));
    }, [updatedBackRoute, selectedAccount, dispatch]);

    const CoinmarketPageHeader = useCallback(
        () => (
            <PageHeader backRoute={updatedBackRoute}>
                <Row width="100%" gap={spacings.md}>
                    <IconButton
                        icon="caretLeft"
                        variant="tertiary"
                        size="medium"
                        onClick={handleBackClick}
                        data-testid="@account-subpage/back"
                    />
                    <BasicName nameId={fallbackTitle} />
                    {currentRouteName !== 'wallet-coinmarket-transactions' && (
                        <Row flex="auto" margin={{ left: 'auto' }}>
                            <CoinmarketLayoutNavigationItem
                                route="wallet-coinmarket-transactions"
                                title="TR_COINMARKET_LAST_TRANSACTIONS"
                            />
                        </Row>
                    )}
                </Row>
            </PageHeader>
        ),
        [updatedBackRoute, fallbackTitle, currentRouteName, handleBackClick],
    );

    useLayout(pageTitle, CoinmarketPageHeader);

    if (!children) return null;

    return children;
};
