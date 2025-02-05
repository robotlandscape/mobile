import { ButtonCell } from '@Components/ButtonCell';
import { SectionHeader } from '@Components/SectionHeader';
import { TableSection } from '@Components/TableSection';
import { ApplicationState } from '@Lib/application_state';
import { MobileDeviceInterface } from '@Lib/interface';
import { ApplicationContext } from '@Root/ApplicationContext';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Platform, Share } from 'react-native';
import { ContentContainer, Label } from './CompanySection.styled';

const URLS = {
  feedback: `mailto:help@standardnotes.com?subject=${
    Platform.OS === 'android' ? 'Android' : 'iOS'
  } app feedback (v${ApplicationState.version})`,
  learn_more: 'https://standardnotes.com',
  privacy: 'https://standardnotes.com/privacy',
  help: 'https://standardnotes.com/help',
  rate: Platform.select({
    ios:
      'https://itunes.apple.com/us/app/standard-notes/id1285392450?ls=1&mt=8',
    android: 'market://details?id=com.standardnotes',
  }) as string,
};

type Props = {
  title: string;
};

export const CompanySection = (props: Props) => {
  const application = useContext(ApplicationContext);
  const [bugsnagOptOut, setBugsnagOptOut] = useState(true);
  const storeName = Platform.OS === 'android' ? 'Play Store' : 'App Store';

  const openUrl = (action: keyof typeof URLS) => {
    application?.deviceInterface!.openUrl(URLS[action]);
  };

  useEffect(() => {
    const getOptedOut = async () => {
      const optedOut = await (application?.deviceInterface as MobileDeviceInterface).getBugsnagOptedOut();
      setBugsnagOptOut(optedOut);
    };
    getOptedOut();
  }, [application?.deviceInterface]);

  const toggleBugnsagOptOut = useCallback(
    async (optOut: boolean) => {
      try {
        await (application?.deviceInterface as MobileDeviceInterface).setBusgnagOptedOut(
          optOut
        );
        setBugsnagOptOut(optOut);
        application?.alertService.alert(
          'Please restart the app to fully apply the requested changes.'
        );
      } catch {
        application?.alertService.alert('An error occured. Please try again.');
      }
    },
    [application?.alertService, application?.deviceInterface]
  );

  const shareEncryption = () => {
    const title = 'The Unexpected Benefits of Encrypted Writing';
    let message = Platform.OS === 'ios' ? title : '';
    const url = 'https://standardnotes.com/why-encrypted';
    // Android ignores url. iOS ignores title.
    if (Platform.OS === 'android') {
      message += '\n\nhttps://standardnotes.com/why-encrypted';
    }
    application?.getAppState().performActionWithoutStateChangeImpact(() => {
      Share.share({ title: title, message: message, url: url });
    });
  };

  const shareWithFriend = () => {
    const title = 'Standard Notes';
    let message =
      'Check out Standard Notes, a free, open-source, and completely encrypted notes app.';
    const url = 'https://standardnotes.com';
    // Android ignores url. iOS ignores title.
    if (Platform.OS === 'android') {
      message += '\n\nhttps://standardnotes.com';
    }
    application?.getAppState().performActionWithoutStateChangeImpact(() => {
      Share.share({ title: title, message: message, url: url });
    });
  };

  return (
    <TableSection>
      <SectionHeader title={props.title} />

      <ButtonCell
        first
        leftAligned={true}
        title="Help"
        onPress={() => openUrl('help')}
      >
        <Label>https://standardnotes.com/help</Label>
      </ButtonCell>
      <ButtonCell
        leftAligned={true}
        title="Contact Support"
        onPress={() => openUrl('feedback')}
      >
        <ContentContainer>
          <Label>help@standardnotes.com</Label>
        </ContentContainer>
      </ButtonCell>

      <ButtonCell
        leftAligned={true}
        title="Spread Encryption"
        onPress={shareEncryption}
      >
        <Label>Share the unexpected benefits of encrypted writing.</Label>
      </ButtonCell>

      <ButtonCell
        leftAligned={true}
        title="Tell a Friend"
        onPress={shareWithFriend}
      >
        <Label>Share Standard Notes with a friend.</Label>
      </ButtonCell>

      <ButtonCell
        leftAligned={true}
        title="Learn About Standard Notes"
        onPress={() => openUrl('learn_more')}
      >
        <Label>https://standardnotes.com</Label>
      </ButtonCell>

      <ButtonCell
        leftAligned={true}
        title="Our Privacy Manifesto"
        onPress={() => openUrl('privacy')}
      >
        <Label>https://standardnotes.com/privacy</Label>
      </ButtonCell>

      <ButtonCell
        leftAligned={true}
        title={
          bugsnagOptOut ? 'Enable Error Reporting' : 'Disable Error Reporting'
        }
        onPress={() => toggleBugnsagOptOut(!bugsnagOptOut)}
      >
        <Label>
          {
            'Help us improve Standard Notes by automatically submitting anonymized error reports.'
          }
        </Label>
      </ButtonCell>

      <ButtonCell
        leftAligned={true}
        title="Rate Standard Notes"
        onPress={() => openUrl('rate')}
      >
        <ContentContainer>
          <Label>Version {ApplicationState.version}</Label>
          <Label>Help support us with a review on the {storeName}.</Label>
        </ContentContainer>
      </ButtonCell>
    </TableSection>
  );
};
