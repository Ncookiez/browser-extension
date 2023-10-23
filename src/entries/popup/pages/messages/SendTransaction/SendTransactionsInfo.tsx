import { TransactionRequest } from '@ethersproject/abstract-provider';
import { useMemo } from 'react';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useRegistryLookup } from '~/core/resources/transactions/registryLookup';
import { useCurrentCurrencyStore } from '~/core/state';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import {
  convertRawAmountToBalance,
  convertRawAmountToNativeDisplay,
} from '~/core/utils/numbers';
import { Box, Inline, Inset, Separator, Stack, Text } from '~/design-system';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useNativeAssetForNetwork } from '~/entries/popup/hooks/useNativeAssetForNetwork';

import { DappHostName, ThisDappIsLikelyMalicious } from '../DappScanStatus';

interface SendTransactionProps {
  request: ProviderRequestPayload;
}

function RequestData({ request }: SendTransactionProps) {
  const { data: dappMetadata } = useDappMetadata({
    url: request?.meta?.sender?.url,
  });
  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });

  const nativeAsset = useNativeAssetForNetwork({
    chainId: activeSession?.chainId || ChainId.mainnet,
  });
  const { currentCurrency } = useCurrentCurrencyStore();

  const { nativeAssetAmount, nativeCurrencyAmount } = useMemo(() => {
    if (!nativeAsset)
      return { nativeAssetAmount: null, nativeCurrencyAmount: null };
    switch (request.method) {
      case 'eth_sendTransaction':
      case 'eth_signTransaction': {
        const tx = request?.params?.[0] as RainbowTransaction;

        const nativeAssetAmount = convertRawAmountToBalance(
          tx?.value?.toString() ?? 0,
          nativeAsset,
        ).display;

        const nativeCurrencyAmount = convertRawAmountToNativeDisplay(
          tx?.value?.toString() ?? 0,
          nativeAsset?.decimals,
          nativeAsset?.price?.value as number,
          currentCurrency,
        ).display;
        return { nativeAssetAmount, nativeCurrencyAmount };
      }
      default:
        return { nativeAssetAmount: null, nativeCurrencyAmount: null };
    }
  }, [request, nativeAsset, currentCurrency]);

  return (
    <Stack
      space="20px"
      alignHorizontal="center"
      justifyContent="center"
      height="full"
    >
      <Stack space="16px" alignHorizontal="center">
        <Text align="center" size="32pt" weight="heavy" color="label">
          {nativeCurrencyAmount || ''}
        </Text>
        <Box background="surfacePrimaryElevated" borderRadius="18px">
          <Inset vertical="6px" left="8px" right="10px">
            <Inline space="4px" alignVertical="center" alignHorizontal="center">
              <ChainBadge
                chainId={nativeAsset?.chainId || ChainId.mainnet}
                size="18"
              />
              <Text size="14pt" weight="semibold" color="label">
                {nativeAssetAmount || ''}
              </Text>
            </Inline>
          </Inset>
        </Box>
      </Stack>
      {dappMetadata?.status === DAppStatus.Scam ? (
        <ThisDappIsLikelyMalicious />
      ) : null}
    </Stack>
  );
}

export function SendTransactionInfo({ request }: SendTransactionProps) {
  const { data: dappMetadata } = useDappMetadata({
    url: request?.meta?.sender?.url,
  });
  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });

  const txRequest = request?.params?.[0] as TransactionRequest;

  const { data: methodName = '' } = useRegistryLookup({
    data: (txRequest?.data as string) || null,
    to: txRequest?.to || null,
    chainId: activeSession?.chainId || ChainId.mainnet,
    hash: null,
  });

  return (
    <Box background="surfacePrimaryElevatedSecondary">
      <Stack
        space="10px"
        paddingHorizontal="20px"
        paddingTop="40px"
        paddingBottom="16px"
        height="full"
      >
        <Stack space="16px" alignItems="center">
          <DappIcon appLogo={dappMetadata?.appLogo} size="32px" />
          <Stack space="12px">
            <DappHostName
              hostName={dappMetadata?.appHostName}
              dappStatus={dappMetadata?.status}
            />
            <Text
              align="center"
              size="14pt"
              weight="bold"
              color="labelSecondary"
            >
              {methodName}
            </Text>
          </Stack>
        </Stack>
        <RequestData request={request} />
      </Stack>

      <Separator color="separatorTertiary" />
    </Box>
  );
}
