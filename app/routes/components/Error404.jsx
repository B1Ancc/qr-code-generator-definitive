import { Card, EmptyState, Text } from "@shopify/polaris";

export default function Error404() {
    return (
        <Card>
            <EmptyState
                heading="Oops! You're lost."
                action={{ content: 'Go to home', url: '/app/home' }}
            >
                <Text>Sorry, the page you're looking for doesn't exist.</Text>
            </EmptyState>
        </Card>
    )
}