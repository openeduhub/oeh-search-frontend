import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
};

export type Query = {
    __typename?: 'Query';
    /** Returns an empty string. GraphQL requires at least one Query to be defined. */
    dummy: Scalars['String'];
};

export type Mutation = {
    __typename?: 'Mutation';
    /** Report a search request being done by a user. */
    searchRequest?: Maybe<Scalars['Boolean']>;
    /** Return a fresh session ID. */
    openSession: Scalars['String'];
    /** Report result clicked by the user. */
    resultClick?: Maybe<Scalars['Boolean']>;
    /** Report a lifecycle state change of the web page. */
    lifecycleEvent?: Maybe<Scalars['Boolean']>;
};

export type MutationSearchRequestArgs = {
    sessionId: Scalars['String'];
    userAgent: Scalars['String'];
    screenWidth: Scalars['Int'];
    screenHeight: Scalars['Int'];
    language: Language;
    searchString: Scalars['String'];
    page: Scalars['Int'];
    filters: Scalars['String'];
    filtersSidebarIsVisible: Scalars['Boolean'];
    numberResults: Scalars['Int'];
};

export type MutationOpenSessionArgs = {
    userAgent: Scalars['String'];
    screenWidth: Scalars['Int'];
    screenHeight: Scalars['Int'];
    language: Language;
};

export type MutationResultClickArgs = {
    sessionId: Scalars['String'];
    userAgent: Scalars['String'];
    screenWidth: Scalars['Int'];
    screenHeight: Scalars['Int'];
    language: Language;
    searchString: Scalars['String'];
    page: Scalars['Int'];
    filters: Scalars['String'];
    filtersSidebarIsVisible: Scalars['Boolean'];
    clickedResult: Scalars['String'];
    clickKind: ClickKind;
};

export type MutationLifecycleEventArgs = {
    sessionId: Scalars['String'];
    userAgent: Scalars['String'];
    screenWidth: Scalars['Int'];
    screenHeight: Scalars['Int'];
    language: Language;
    event: LifecycleEvent;
    state: Scalars['String'];
};

export enum Language {
    De = 'de',
    En = 'en',
}

export enum ClickKind {
    Click = 'click',
    MiddleClick = 'middleClick',
    Contextmenu = 'contextmenu',
}

export enum LifecycleEvent {
    Visibilitychange = 'visibilitychange',
    Pagehide = 'pagehide',
}

export type OpenAnalyticsSessionMutationVariables = Exact<{
    userAgent: Scalars['String'];
    screenWidth: Scalars['Int'];
    screenHeight: Scalars['Int'];
    language: Language;
}>;

export type OpenAnalyticsSessionMutation = { __typename?: 'Mutation' } & Pick<
    Mutation,
    'openSession'
>;

export type ReportLifecycleEventMutationVariables = Exact<{
    userAgent: Scalars['String'];
    screenWidth: Scalars['Int'];
    screenHeight: Scalars['Int'];
    sessionId: Scalars['String'];
    event: LifecycleEvent;
    state: Scalars['String'];
    language: Language;
}>;

export type ReportLifecycleEventMutation = { __typename?: 'Mutation' } & Pick<
    Mutation,
    'lifecycleEvent'
>;

export type ReportResultClickMutationVariables = Exact<{
    userAgent: Scalars['String'];
    screenWidth: Scalars['Int'];
    screenHeight: Scalars['Int'];
    sessionId: Scalars['String'];
    searchString: Scalars['String'];
    page: Scalars['Int'];
    filters: Scalars['String'];
    filtersSidebarIsVisible: Scalars['Boolean'];
    language: Language;
    clickedResult: Scalars['String'];
    clickKind: ClickKind;
}>;

export type ReportResultClickMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'resultClick'>;

export type ReportSearchRequestMutationVariables = Exact<{
    userAgent: Scalars['String'];
    screenWidth: Scalars['Int'];
    screenHeight: Scalars['Int'];
    sessionId: Scalars['String'];
    searchString: Scalars['String'];
    page: Scalars['Int'];
    filters: Scalars['String'];
    filtersSidebarIsVisible: Scalars['Boolean'];
    language: Language;
    numberResults: Scalars['Int'];
}>;

export type ReportSearchRequestMutation = { __typename?: 'Mutation' } & Pick<
    Mutation,
    'searchRequest'
>;

export const OpenAnalyticsSessionDocument = gql`
    mutation openAnalyticsSession(
        $userAgent: String!
        $screenWidth: Int!
        $screenHeight: Int!
        $language: Language!
    ) {
        openSession(
            userAgent: $userAgent
            screenWidth: $screenWidth
            screenHeight: $screenHeight
            language: $language
        )
    }
`;

@Injectable({
    providedIn: 'root',
})
export class OpenAnalyticsSessionGQL extends Apollo.Mutation<
    OpenAnalyticsSessionMutation,
    OpenAnalyticsSessionMutationVariables
> {
    document = OpenAnalyticsSessionDocument;

    constructor(apollo: Apollo.Apollo) {
        super(apollo);
    }
}
export const ReportLifecycleEventDocument = gql`
    mutation reportLifecycleEvent(
        $userAgent: String!
        $screenWidth: Int!
        $screenHeight: Int!
        $sessionId: String!
        $event: LifecycleEvent!
        $state: String!
        $language: Language!
    ) {
        lifecycleEvent(
            userAgent: $userAgent
            screenWidth: $screenWidth
            screenHeight: $screenHeight
            sessionId: $sessionId
            language: $language
            event: $event
            state: $state
        )
    }
`;

@Injectable({
    providedIn: 'root',
})
export class ReportLifecycleEventGQL extends Apollo.Mutation<
    ReportLifecycleEventMutation,
    ReportLifecycleEventMutationVariables
> {
    document = ReportLifecycleEventDocument;

    constructor(apollo: Apollo.Apollo) {
        super(apollo);
    }
}
export const ReportResultClickDocument = gql`
    mutation reportResultClick(
        $userAgent: String!
        $screenWidth: Int!
        $screenHeight: Int!
        $sessionId: String!
        $searchString: String!
        $page: Int!
        $filters: String!
        $filtersSidebarIsVisible: Boolean!
        $language: Language!
        $clickedResult: String!
        $clickKind: ClickKind!
    ) {
        resultClick(
            userAgent: $userAgent
            screenWidth: $screenWidth
            screenHeight: $screenHeight
            sessionId: $sessionId
            searchString: $searchString
            page: $page
            filters: $filters
            filtersSidebarIsVisible: $filtersSidebarIsVisible
            language: $language
            clickedResult: $clickedResult
            clickKind: $clickKind
        )
    }
`;

@Injectable({
    providedIn: 'root',
})
export class ReportResultClickGQL extends Apollo.Mutation<
    ReportResultClickMutation,
    ReportResultClickMutationVariables
> {
    document = ReportResultClickDocument;

    constructor(apollo: Apollo.Apollo) {
        super(apollo);
    }
}
export const ReportSearchRequestDocument = gql`
    mutation reportSearchRequest(
        $userAgent: String!
        $screenWidth: Int!
        $screenHeight: Int!
        $sessionId: String!
        $searchString: String!
        $page: Int!
        $filters: String!
        $filtersSidebarIsVisible: Boolean!
        $language: Language!
        $numberResults: Int!
    ) {
        searchRequest(
            userAgent: $userAgent
            screenWidth: $screenWidth
            screenHeight: $screenHeight
            sessionId: $sessionId
            searchString: $searchString
            page: $page
            filters: $filters
            filtersSidebarIsVisible: $filtersSidebarIsVisible
            language: $language
            numberResults: $numberResults
        )
    }
`;

@Injectable({
    providedIn: 'root',
})
export class ReportSearchRequestGQL extends Apollo.Mutation<
    ReportSearchRequestMutation,
    ReportSearchRequestMutationVariables
> {
    document = ReportSearchRequestDocument;

    constructor(apollo: Apollo.Apollo) {
        super(apollo);
    }
}
