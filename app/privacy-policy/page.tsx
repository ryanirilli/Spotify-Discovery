"use client";

import {
  Box,
  Container,
  Heading,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";

export default function PrivacyPolicy() {
  return (
    <Box bg="gray.900" color="white" minH="100vh">
      <Container py={32}>
        <Heading mb={8}>Privacy Policy</Heading>
        <Text mb={8}>Thank you for peeping Disco Stu.</Text>
        <Text mb={8}>
          I take your privacy very seriously and have implemented measures to
          ensure that your personal information is protected. When you use my
          website, you may choose to login using your Spotify account via OAuth.
          During this process, I ask for your permission to access the following
          scopes:
        </Text>
        <UnorderedList mb={8}>
          <ListItem>user-read-private</ListItem>{" "}
          <ListItem>user-read-email</ListItem>
          <ListItem>playlist-read-private</ListItem>{" "}
          <ListItem>playlist-modify-private</ListItem>
          <ListItem>playlist-modify-public</ListItem>
        </UnorderedList>
        <Text mb={8}>
          This allows me to access the necessary information to provide you with
          the services and features of my website. However, please note that I
          do not store any information about you, including your personal data,
          browsing history, or any other data that can be used to identify you.
          In addition, I do not share your information with any third-party
          companies or organizations.
        </Text>{" "}
        <Text mb={8}>
          I respect your privacy and will not disclose your information to any
          unauthorized parties. I use cookies to improve your user experience
          and to ensure the proper functioning of my website. These cookies do
          not collect any personal information and are only used for functional
          purposes. If you have any questions or concerns about my privacy
          policy, please do not hesitate to contact me at discostuapp@gmail.com
        </Text>
        <Text>
          By using my website, you agree to the privacy policy and to the terms
          and conditions of my service. I reserve the right to modify this
          policy at any time, so please check back regularly for updates.
        </Text>
      </Container>
    </Box>
  );
}
