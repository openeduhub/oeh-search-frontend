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
    /** Get auto-completion suggestions based on a search string while typing */
    autoComplete: Array<Scalars['String']>;
    /** A possible spell correction based on the given query */
    didYouMeanSuggestion?: Maybe<DidYouMeanSuggestion>;
    /** Returns an empty string. GraphQL requires at least one Query to be defined. */
    dummy: Scalars['String'];
    /** Get a single facet, taking the given query into account */
    facet: Aggregation;
    /** TODO */
    facetSuggestions: Array<Aggregation>;
    /** Get multiple facets, taking the given query into account */
    facets: Array<Aggregation>;
    /** Get a single entry */
    get: Hit;
    /** Search for materials within the ElasticSearch index */
    search: SearchResult;
    subjectsPortals: SubjectsPortals;
};

export type QueryAutoCompleteArgs = {
    searchString: Scalars['String'];
    filters?: Maybe<Array<Filter>>;
    language?: Maybe<Language>;
};

export type QueryDidYouMeanSuggestionArgs = {
    searchString: Scalars['String'];
    filters?: Maybe<Array<Filter>>;
    language?: Maybe<Language>;
};

export type QueryFacetArgs = {
    facet: Facet;
    size?: Scalars['Int'];
    searchString?: Maybe<Scalars['String']>;
    filters?: Maybe<Array<Filter>>;
    language?: Maybe<Language>;
    skipOutputMapping?: Maybe<Scalars['Boolean']>;
};

export type QueryFacetSuggestionsArgs = {
    facets: Array<Facet>;
    size?: Scalars['Int'];
    language: Language;
    inputString?: Maybe<Scalars['String']>;
    searchString?: Maybe<Scalars['String']>;
    filters?: Maybe<Array<Filter>>;
};

export type QueryFacetsArgs = {
    facets: Array<Facet>;
    size?: Scalars['Int'];
    searchString?: Maybe<Scalars['String']>;
    filters?: Maybe<Array<Filter>>;
    language?: Maybe<Language>;
    skipOutputMapping?: Maybe<Scalars['Boolean']>;
};

export type QueryGetArgs = {
    id: Scalars['ID'];
    language?: Maybe<Language>;
};

export type QuerySearchArgs = {
    size?: Scalars['Int'];
    searchString?: Maybe<Scalars['String']>;
    language?: Maybe<Language>;
    filters?: Maybe<Array<Filter>>;
    includeCollectionTags?: Maybe<Scalars['Boolean']>;
    from?: Maybe<Scalars['Int']>;
};

export type QuerySubjectsPortalsArgs = {
    size?: Scalars['Int'];
    language: Language;
};

export enum Language {
    De = 'de',
    En = 'en',
}

export enum Facet {
    Source = 'source',
    Keyword = 'keyword',
    Discipline = 'discipline',
    EducationalContext = 'educationalContext',
    LearningResourceType = 'learningResourceType',
    IntendedEndUserRole = 'intendedEndUserRole',
    Type = 'type',
    EditorialTag = 'editorialTag',
}

export enum SimpleFilter {
    Oer = 'oer',
}

/**
 * Filter by either `facet` or `simpleFilter`.
 *
 * The difference is not relevant for filtering, but separate fields are required since
 * the `Facet` type is used for the `facet` query as well.
 */
export type Filter = {
    facet?: Maybe<Facet>;
    simpleFilter?: Maybe<SimpleFilter>;
    terms?: Maybe<Array<Scalars['String']>>;
};

export type SearchResult = {
    __typename?: 'SearchResult';
    /** Time it took ElasticSearch to handle the request in milliseconds */
    took: Scalars['Int'];
    /** Number of search results */
    total: TotalHits;
    /** Search results of the given query */
    hits: Array<Hit>;
};

export type TotalHits = {
    __typename?: 'TotalHits';
    value: Scalars['Int'];
    relation: TotalHitsRelation;
};

export enum TotalHitsRelation {
    Eq = 'eq',
    Gte = 'gte',
}

export type Hit = {
    __typename?: 'Hit';
    /** UUID issued by Edu-Sharing */
    id: Scalars['ID'];
    /** Metadata according to the LOM standard */
    lom: Lom;
    /** Metadata described via SkoHub vocabs */
    skos: Skos;
    /** The type of media the entry represents */
    type: Type;
    /** Content source */
    source: Source;
    /** The material's legal license */
    license: License;
    /** A list of tags assigned by the editorial team */
    editorialTags: Array<EditorialTag>;
    /** A preview image in different resolutions */
    previewImage: PreviewImage;
};

export type Lom = {
    __typename?: 'Lom';
    technical: LomTechnical;
    general: LomGeneral;
};

export type LomTechnical = {
    __typename?: 'LomTechnical';
    /** Content URL */
    location: Scalars['String'];
};

export type LomGeneral = {
    __typename?: 'LomGeneral';
    title: Scalars['String'];
    keyword?: Maybe<Array<Scalars['String']>>;
    description?: Maybe<Scalars['String']>;
};

export type Skos = {
    __typename?: 'Skos';
    discipline?: Maybe<Array<SkosEntry>>;
    educationalContext?: Maybe<Array<SkosEntry>>;
    learningResourceType?: Maybe<Array<SkosEntry>>;
    intendedEndUserRole?: Maybe<Array<SkosEntry>>;
};

export type SkosEntry = {
    __typename?: 'SkosEntry';
    id: Scalars['ID'];
    label: Scalars['String'];
};

export enum Type {
    Content = 'content',
    Portal = 'portal',
    Tool = 'tool',
    LessonPlanning = 'lessonPlanning',
    Method = 'method',
}

export type Source = {
    __typename?: 'Source';
    /** A unique string that identifies the source */
    id: Scalars['ID'];
    /** A friendly name to display */
    name: Scalars['String'];
    /** The source's web presence */
    url: Scalars['String'];
};

export type License = {
    __typename?: 'License';
    oer: Scalars['Boolean'];
};

export enum EditorialTag {
    Recommended = 'recommended',
}

export type PreviewImage = {
    __typename?: 'PreviewImage';
    /** A thumbnail-sized preview image which will we directly embedded into the response if available */
    thumbnail: Thumbnail;
    /** URL to a high-resolution version of the preview image */
    url: Scalars['String'];
};

export type Thumbnail = EmbeddedThumbnail | ExternalThumbnail;

export type EmbeddedThumbnail = {
    __typename?: 'EmbeddedThumbnail';
    mimetype: Scalars['String'];
    /** Base64-encoded image in the format given by `mimetype` */
    image: Scalars['String'];
};

export type ExternalThumbnail = {
    __typename?: 'ExternalThumbnail';
    url: Scalars['String'];
};

export type Aggregation = {
    __typename?: 'Aggregation';
    facet: Facet;
    buckets: Array<Bucket>;
    total_buckets: Scalars['Int'];
};

export type Bucket = {
    __typename?: 'Bucket';
    key: Scalars['String'];
    doc_count: Scalars['Int'];
};

export type DidYouMeanSuggestion = {
    __typename?: 'DidYouMeanSuggestion';
    plain: Scalars['String'];
    html: Scalars['String'];
};

export type SubjectsPortals = {
    __typename?: 'SubjectsPortals';
    grundschule: Array<SubjectsPortalDiscipline>;
    sekundarstufe_1: Array<SubjectsPortalDiscipline>;
    sekundarstufe_2: Array<SubjectsPortalDiscipline>;
    berufliche_bildung: Array<SubjectsPortalDiscipline>;
    erwachsenenbildung: Array<SubjectsPortalDiscipline>;
    allgemeinbildende_schule: Array<SubjectsPortalDiscipline>;
    foerderschule: Array<SubjectsPortalDiscipline>;
};

export type SubjectsPortalDiscipline = {
    __typename?: 'SubjectsPortalDiscipline';
    id: Scalars['String'];
    url: Scalars['String'];
    doc_count: Scalars['Int'];
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

export type AutoCompleteQueryVariables = Exact<{
    searchString: Scalars['String'];
    filters?: Maybe<Array<Filter>>;
    language: Language;
}>;

export type AutoCompleteQuery = { __typename?: 'Query' } & Pick<Query, 'autoComplete'>;

export type DidYouMeanSuggestionQueryVariables = Exact<{
    searchString: Scalars['String'];
    filters?: Maybe<Array<Filter>>;
    language: Language;
}>;

export type DidYouMeanSuggestionQuery = { __typename?: 'Query' } & {
    didYouMeanSuggestion?: Maybe<
        { __typename?: 'DidYouMeanSuggestion' } & DidYouMeanSuggestionFragment
    >;
};

export type DidYouMeanSuggestionFragment = { __typename?: 'DidYouMeanSuggestion' } & Pick<
    DidYouMeanSuggestion,
    'plain' | 'html'
>;

export type FacetQueryVariables = Exact<{
    searchString?: Maybe<Scalars['String']>;
    filters?: Maybe<Array<Filter>>;
    language: Language;
    facet: Facet;
    size: Scalars['Int'];
}>;

export type FacetQuery = { __typename?: 'Query' } & {
    facet: { __typename?: 'Aggregation' } & AggregationFragment;
};

export type FacetSuggestionsQueryVariables = Exact<{
    inputString?: Maybe<Scalars['String']>;
    searchString?: Maybe<Scalars['String']>;
    filters?: Maybe<Array<Filter>>;
    language: Language;
}>;

export type FacetSuggestionsQuery = { __typename?: 'Query' } & {
    facetSuggestions: Array<{ __typename?: 'Aggregation' } & AggregationFragment>;
};

export type AggregationFragment = { __typename?: 'Aggregation' } & Pick<
    Aggregation,
    'facet' | 'total_buckets'
> & { buckets: Array<{ __typename?: 'Bucket' } & Pick<Bucket, 'doc_count' | 'key'>> };

export type FacetsQueryVariables = Exact<{
    searchString?: Maybe<Scalars['String']>;
    filters?: Maybe<Array<Filter>>;
    language: Language;
}>;

export type FacetsQuery = { __typename?: 'Query' } & {
    facets: Array<{ __typename?: 'Aggregation' } & AggregationFragment>;
};

export type GetEntryQueryVariables = Exact<{
    id: Scalars['ID'];
    language: Language;
}>;

export type GetEntryQuery = { __typename?: 'Query' } & {
    get: { __typename?: 'Hit' } & SearchHitFragment;
};

export type SearchQueryVariables = Exact<{
    searchString: Scalars['String'];
    from?: Scalars['Int'];
    size: Scalars['Int'];
    filters?: Maybe<Array<Filter>>;
    language?: Maybe<Language>;
}>;

export type SearchQuery = { __typename?: 'Query' } & {
    search: { __typename?: 'SearchResult' } & ResultFragment;
};

export type ResultFragment = { __typename?: 'SearchResult' } & Pick<SearchResult, 'took'> & {
        total: { __typename?: 'TotalHits' } & Pick<TotalHits, 'value' | 'relation'>;
        hits: Array<{ __typename?: 'Hit' } & SearchHitFragment>;
    };

export type SearchHitFragment = { __typename?: 'Hit' } & Pick<
    Hit,
    'id' | 'type' | 'editorialTags'
> & {
        lom: { __typename?: 'Lom' } & {
            general: { __typename?: 'LomGeneral' } & Pick<
                LomGeneral,
                'title' | 'keyword' | 'description'
            >;
            technical: { __typename?: 'LomTechnical' } & Pick<LomTechnical, 'location'>;
        };
        source: { __typename?: 'Source' } & Pick<Source, 'name' | 'url'>;
        license: { __typename?: 'License' } & Pick<License, 'oer'>;
        previewImage: { __typename?: 'PreviewImage' } & Pick<PreviewImage, 'url'> & {
                thumbnail:
                    | ({ __typename?: 'EmbeddedThumbnail' } & Pick<
                          EmbeddedThumbnail,
                          'mimetype' | 'image'
                      >)
                    | ({ __typename?: 'ExternalThumbnail' } & Pick<ExternalThumbnail, 'url'>);
            };
        skos: { __typename?: 'Skos' } & {
            discipline?: Maybe<Array<{ __typename?: 'SkosEntry' } & SkosEntryFragment>>;
            educationalContext?: Maybe<Array<{ __typename?: 'SkosEntry' } & SkosEntryFragment>>;
            learningResourceType?: Maybe<Array<{ __typename?: 'SkosEntry' } & SkosEntryFragment>>;
        };
    };

export type SkosEntryFragment = { __typename?: 'SkosEntry' } & Pick<SkosEntry, 'id' | 'label'>;

export const DidYouMeanSuggestionFragmentDoc = gql`
    fragment didYouMeanSuggestion on DidYouMeanSuggestion {
        plain
        html
    }
`;
export const AggregationFragmentDoc = gql`
    fragment aggregation on Aggregation {
        buckets {
            doc_count
            key
        }
        facet
        total_buckets
    }
`;
export const SkosEntryFragmentDoc = gql`
    fragment skosEntry on SkosEntry {
        id
        label
    }
`;
export const SearchHitFragmentDoc = gql`
    fragment searchHit on Hit {
        id
        lom {
            general {
                title
                keyword
                description
            }
            technical {
                location
            }
        }
        type
        source {
            name
            url
        }
        license {
            oer
        }
        editorialTags
        previewImage {
            thumbnail {
                ... on EmbeddedThumbnail {
                    mimetype
                    image
                }
                ... on ExternalThumbnail {
                    url
                }
            }
            url
        }
        skos {
            discipline {
                ...skosEntry
            }
            educationalContext {
                ...skosEntry
            }
            learningResourceType {
                ...skosEntry
            }
        }
    }
    ${SkosEntryFragmentDoc}
`;
export const ResultFragmentDoc = gql`
    fragment result on SearchResult {
        took
        total {
            value
            relation
        }
        hits {
            ...searchHit
        }
    }
    ${SearchHitFragmentDoc}
`;
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
export const AutoCompleteDocument = gql`
    query AutoComplete($searchString: String!, $filters: [Filter!], $language: Language!) {
        autoComplete(searchString: $searchString, filters: $filters, language: $language)
    }
`;

@Injectable({
    providedIn: 'root',
})
export class AutoCompleteGQL extends Apollo.Query<AutoCompleteQuery, AutoCompleteQueryVariables> {
    document = AutoCompleteDocument;

    constructor(apollo: Apollo.Apollo) {
        super(apollo);
    }
}
export const DidYouMeanSuggestionDocument = gql`
    query DidYouMeanSuggestion($searchString: String!, $filters: [Filter!], $language: Language!) {
        didYouMeanSuggestion(searchString: $searchString, filters: $filters, language: $language) {
            ...didYouMeanSuggestion
        }
    }
    ${DidYouMeanSuggestionFragmentDoc}
`;

@Injectable({
    providedIn: 'root',
})
export class DidYouMeanSuggestionGQL extends Apollo.Query<
    DidYouMeanSuggestionQuery,
    DidYouMeanSuggestionQueryVariables
> {
    document = DidYouMeanSuggestionDocument;

    constructor(apollo: Apollo.Apollo) {
        super(apollo);
    }
}
export const FacetDocument = gql`
    query Facet(
        $searchString: String
        $filters: [Filter!]
        $language: Language!
        $facet: Facet!
        $size: Int!
    ) {
        facet(
            searchString: $searchString
            size: $size
            filters: $filters
            language: $language
            facet: $facet
        ) {
            ...aggregation
        }
    }
    ${AggregationFragmentDoc}
`;

@Injectable({
    providedIn: 'root',
})
export class FacetGQL extends Apollo.Query<FacetQuery, FacetQueryVariables> {
    document = FacetDocument;

    constructor(apollo: Apollo.Apollo) {
        super(apollo);
    }
}
export const FacetSuggestionsDocument = gql`
    query FacetSuggestions(
        $inputString: String
        $searchString: String
        $filters: [Filter!]
        $language: Language!
    ) {
        facetSuggestions(
            inputString: $inputString
            searchString: $searchString
            size: 5
            filters: $filters
            language: $language
            facets: [
                discipline
                educationalContext
                intendedEndUserRole
                keyword
                learningResourceType
                source
                type
            ]
        ) {
            ...aggregation
        }
    }
    ${AggregationFragmentDoc}
`;

@Injectable({
    providedIn: 'root',
})
export class FacetSuggestionsGQL extends Apollo.Query<
    FacetSuggestionsQuery,
    FacetSuggestionsQueryVariables
> {
    document = FacetSuggestionsDocument;

    constructor(apollo: Apollo.Apollo) {
        super(apollo);
    }
}
export const FacetsDocument = gql`
    query Facets($searchString: String, $filters: [Filter!], $language: Language!) {
        facets(
            searchString: $searchString
            size: 20
            filters: $filters
            language: $language
            facets: [
                discipline
                educationalContext
                intendedEndUserRole
                keyword
                learningResourceType
                source
                type
            ]
        ) {
            ...aggregation
        }
    }
    ${AggregationFragmentDoc}
`;

@Injectable({
    providedIn: 'root',
})
export class FacetsGQL extends Apollo.Query<FacetsQuery, FacetsQueryVariables> {
    document = FacetsDocument;

    constructor(apollo: Apollo.Apollo) {
        super(apollo);
    }
}
export const GetEntryDocument = gql`
    query GetEntry($id: ID!, $language: Language!) {
        get(id: $id, language: $language) {
            ...searchHit
        }
    }
    ${SearchHitFragmentDoc}
`;

@Injectable({
    providedIn: 'root',
})
export class GetEntryGQL extends Apollo.Query<GetEntryQuery, GetEntryQueryVariables> {
    document = GetEntryDocument;

    constructor(apollo: Apollo.Apollo) {
        super(apollo);
    }
}
export const SearchDocument = gql`
    query Search(
        $searchString: String!
        $from: Int! = 0
        $size: Int!
        $filters: [Filter!]
        $language: Language
    ) {
        search(
            searchString: $searchString
            from: $from
            size: $size
            filters: $filters
            language: $language
        ) {
            ...result
        }
    }
    ${ResultFragmentDoc}
`;

@Injectable({
    providedIn: 'root',
})
export class SearchGQL extends Apollo.Query<SearchQuery, SearchQueryVariables> {
    document = SearchDocument;

    constructor(apollo: Apollo.Apollo) {
        super(apollo);
    }
}
