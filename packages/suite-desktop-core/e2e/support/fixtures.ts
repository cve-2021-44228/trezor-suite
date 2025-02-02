/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, Page } from '@playwright/test';

import {
    SetupEmu,
    StartEmu,
    TrezorUserEnvLink,
    TrezorUserEnvLinkClass,
} from '@trezor/trezor-user-env-link';

import { DashboardActions } from './pageActions/dashboardActions';
import { getApiUrl, getElectronVideoPath, launchSuite } from './common';
import { SettingsActions } from './pageActions/settingsActions';
import { SuiteGuide } from './pageActions/suiteGuideActions';
import { WalletActions } from './pageActions/walletActions';
import { OnboardingActions } from './pageActions/onboardingActions';
import { PlaywrightProjects } from '../playwright.config';
import { AnalyticsFixture } from './analytics';

type Fixtures = {
    startEmulator: boolean;
    emulatorStartConf: StartEmu;
    emulatorSetupConf: SetupEmu;
    apiURL: string;
    trezorUserEnvLink: TrezorUserEnvLinkClass;
    electronWindow: Page | undefined;
    page: Page;
    dashboardPage: DashboardActions;
    settingsPage: SettingsActions;
    suiteGuidePage: SuiteGuide;
    walletPage: WalletActions;
    onboardingPage: OnboardingActions;
    analytics: AnalyticsFixture;
};

const test = base.extend<Fixtures>({
    startEmulator: true,
    emulatorStartConf: {},
    emulatorSetupConf: {},
    apiURL: async ({ baseURL }, use, testInfo) => {
        await use(getApiUrl(baseURL, testInfo));
    },
    /* eslint-disable-next-line no-empty-pattern */
    trezorUserEnvLink: async ({}, use) => {
        await use(TrezorUserEnvLink);
    },
    electronWindow: async (
        {
            trezorUserEnvLink,
            startEmulator,
            emulatorStartConf,
            emulatorSetupConf,
            locale,
            colorScheme,
        },
        use,
        testInfo,
    ) => {
        // We need to ensure emulator is running before launching the suite
        if (startEmulator) {
            await trezorUserEnvLink.stopBridge();
            await trezorUserEnvLink.stopEmu();
            await trezorUserEnvLink.connect();
            await trezorUserEnvLink.startEmu(emulatorStartConf);
            await trezorUserEnvLink.setupEmu(emulatorSetupConf);
        }

        if (testInfo.project.name === PlaywrightProjects.Desktop) {
            const suite = await launchSuite({
                locale,
                colorScheme,
                videoFolder: testInfo.outputDir,
            });
            await use(suite.window);
            await suite.electronApp.close(); // Ensure cleanup after tests
        } else {
            if (startEmulator) {
                await trezorUserEnvLink.startBridge();
            }
            await use(undefined);
        }
    },
    page: async ({ electronWindow, page: webPage }, use, testInfo) => {
        if (electronWindow) {
            await webPage.close(); // Close the default chromium page
            await electronWindow.context().tracing.start({ screenshots: true, snapshots: true });
            await use(electronWindow);
            const tracePath = `${testInfo.outputDir}/trace.electron.zip`;
            await electronWindow.context().tracing.stop({ path: tracePath });
            testInfo.attachments.push({
                name: 'trace',
                path: tracePath,
                contentType: 'application/zip',
            });
            testInfo.attachments.push({
                name: 'video',
                path: getElectronVideoPath(testInfo.outputDir),
                contentType: 'video/webm',
            });
        } else {
            await webPage.context().addInitScript(() => {
                // Tells the app to attach Redux Store to window object. packages/suite-web/src/support/useCypress.ts
                window.Playwright = true;
            });
            await webPage.goto('./');
            await use(webPage);
        }
    },
    dashboardPage: async ({ page }, use) => {
        const dashboardPage = new DashboardActions(page);
        await use(dashboardPage);
    },
    settingsPage: async ({ page, apiURL }, use) => {
        const settingsPage = new SettingsActions(page, apiURL);
        await use(settingsPage);
    },
    suiteGuidePage: async ({ page }, use) => {
        const suiteGuidePage = new SuiteGuide(page);
        await use(suiteGuidePage);
    },
    walletPage: async ({ page }, use) => {
        const walletPage = new WalletActions(page);
        await use(walletPage);
    },
    onboardingPage: async ({ page, emulatorStartConf }, use, testInfo) => {
        const onboardingPage = new OnboardingActions(
            page,
            emulatorStartConf.model ?? TrezorUserEnvLink.defaultModel,
            testInfo,
        );
        await use(onboardingPage);
    },
    analytics: async ({ page }, use) => {
        const analytics = new AnalyticsFixture(page);
        await use(analytics);
    },
});

export { test };
export { expect } from './customMatchers';
