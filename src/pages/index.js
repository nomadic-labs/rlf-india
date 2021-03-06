import React from "react";
import { graphql } from "gatsby";
import { connect } from "react-redux";
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import { EditableText, EditableParagraph, EditableBackgroundImage } from "react-easy-editables";

import {
  updatePage,
  loadPageData,
  validateAccessCode,
} from "../redux/actions";

import { uploadImage } from '../firebase/operations';

import Layout from "../layouts/default.js";
import Section from "../components/common/Section"
import Gallery from "../components/common/Gallery"
import ParticipantGallery from "../components/common/ParticipantGallery"
import ProgramElements from "../components/common/ProgramElements"

const mapDispatchToProps = dispatch => {
  return {
    onUpdatePageData: (page, id, data) => {
      dispatch(updatePage(page, id, data));
    },
    onLoadPageData: data => {
      dispatch(loadPageData(data));
    },
    validateAccessCode: (code) => {
      dispatch(validateAccessCode(code));
    },
  };
};

const mapStateToProps = state => {
  return {
    pageData: state.page.data,
    isLoggedIn: state.adminTools.isLoggedIn,
    accessGranted: state.adminTools.accessGranted,
  };
};

class HomePage extends React.Component {

  constructor(props) {
    super(props)
    const initialPageData = {
      ...this.props.data.pages,
      content: JSON.parse(this.props.data.pages.content)
    };
    this.state = {
      tweets: [],
      tweetCount: 2
    }

    this.props.onLoadPageData(initialPageData);
  }

  componentDidMount() {
    this.loadTwitterFeed()
  }

  componentDidUpdate(prevProps) {
    if (this.props.pageData?.content?.hashtags !== prevProps.pageData?.content?.hashtags) {
      this.loadTwitterFeed()
    }
  }

  loadTwitterFeed = () => {
    const content = this.props.pageData ? this.props.pageData.content : JSON.parse(this.props.data.pages.content);
    const hashtags = Object.values(content["hashtags"]).filter(t => t?.text)
    const query = hashtags
                    .map(t => `tweets[]=${encodeURIComponent(t.text)}`)
                    .join('&')

    console.log(`Loading Twitter feed for query: ${query}`)
    fetch(`https://us-central1-rlgna-staging.cloudfunctions.net/tweets?${query}`, {
      headers: {
        'Accept': 'application/json'
      },
    }).then(response => response.json())
      .then(data => this.setState({ tweets: data.statuses.filter(t => !t.retweeted_status) }))
      .catch(e => console.error(e));
  }

  onSave = id => content => {
    this.props.onUpdatePageData("home", id, content);
  };

  onAccessCodeSubmit = e => {
    e.preventDefault()
    this.props.validateAccessCode(this.state.accessCode)
    this.setState({ accessCode: '' })
  }

  render() {
    const content = this.props.pageData ? this.props.pageData.content : JSON.parse(this.props.data.pages.content);

    if (!this.props.accessGranted) {
      return(
        <Layout theme="gray" location={this.props.location}>
          <EditableBackgroundImage
            classes="header-bg-image animate__animated animate__fadeIn"
            content={content["landing-bg-image"]}
            onSave={this.onSave("landing-bg-image")}
            uploadImage={uploadImage}
            styles={{ backgroundPosition: 'bottom' }}
          >
            <div className="gradient-overlay" />
            <section id="landing" className="animate__animated animate__fadeIn">
              <Container maxWidth="lg" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <Grid container>
                  <Grid item md={8}>
                    <div className="mb-4">
                      <div className="text-white font-size-h4 mb-4 event-dates">
                        <EditableText content={content["landing-subtitle"]} onSave={this.onSave("landing-subtitle")} />
                      </div>
                    </div>
                    <div className="">
                      <h1 className="text-white"><EditableText content={content["landing-title"]} onSave={this.onSave("landing-title")} /></h1>
                    </div>
                  </Grid>
                </Grid>
                <Hidden smDown>
                <Grid container justify="flex-end">
                  <Grid item xs={12} md={8}>
                    <form onSubmit={this.onAccessCodeSubmit} autoComplete="off" className="login-form mt-10 mb-6 display-flex align-center justify-right">
                      <div className="help-text text-white text-bold">
                        <label id="access-code-label"><EditableText id="access-code" content={content["access-code"]} onSave={this.onSave("access-code")} /></label>
                      </div>
                      <input aria-labelledby="access-code-label" type="text" className="ml-2" id="access-code" onChange={e => this.setState({ accessCode: e.currentTarget.value })} />
                      <input type="submit" value="Enter site" className="btn ml-2" />
                    </form>
                  </Grid>
                </Grid>
                </Hidden>
              </Container>
            </section>
          </EditableBackgroundImage>
          <Hidden mdUp>
            <section id="login-mobile" className="bg-light">
              <Container>
                <Grid container justify="center">
                  <Grid item xs={12}>
                    <form onSubmit={this.onAccessCodeSubmit} autoComplete="off" className="login-form mt-10 mb-6 display-flex flex-column">
                      <div className="help-text text-white text-bold mb-2">
                        <label id="access-code-label"><EditableText id="access-code" content={content["access-code"]} onSave={this.onSave("access-code")} /></label>
                      </div>
                      <input aria-labelledby="access-code-label" type="text" className="ml-2" id="access-code" onChange={e => this.setState({ accessCode: e.currentTarget.value })} />
                      <input type="submit" value="Enter site" className="btn ml-2" />
                    </form>
                  </Grid>
                </Grid>
              </Container>
            </section>
          </Hidden>
        </Layout>
      )
    }

    return (
      <Layout theme="gray" location={this.props.location}>
        <EditableBackgroundImage
          classes="header-bg-image animate__animated animate__fadeIn"
          content={content["landing-bg-image"]}
          onSave={this.onSave("landing-bg-image")}
          uploadImage={uploadImage}
          styles={{ backgroundPosition: 'bottom' }}
        >
          <div className="gradient-overlay" />
          <section id="landing" data-aos="fade-down">
            <Container maxWidth="lg" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <Grid container>
                <Grid item md={8}>
                  <div className="mb-4">
                      <div className="text-white font-size-h4 mb-4 event-dates">
                        <EditableText content={content["landing-subtitle"]} onSave={this.onSave("landing-subtitle")} />
                      </div>
                    </div>
                    <div className="">
                      <h1 className="text-white"><EditableText content={content["landing-title"]} onSave={this.onSave("landing-title")} /></h1>
                    </div>
                </Grid>
              </Grid>
            </Container>
          </section>
        </EditableBackgroundImage>

        <Section id="intro" className={`position-relative bg-white`}>
          <Grid container className="title" justify="flex-start" data-aos="fade-up">
            <Grid item xs={12} md={8}>
              <h2 className="text-dark">
                <EditableText content={content["intro-title"]} onSave={this.onSave("intro-title")} />
              </h2>
              <EditableParagraph classes="text-dark mb-3" content={content["intro-text"]} onSave={this.onSave("intro-text")} />
            </Grid>
          </Grid>
        </Section>

        <Section id="program-elements">
          <Grid container>
            <Grid item xs={12} md={8}>
              <h2>
                <EditableText content={content["program-elements-title"]} onSave={this.onSave("program-elements-title")} />
              </h2>
              <p className="text-small text-bold">{`Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`}</p>
            </Grid>
            <ProgramElements
              content={content["program-elements-collection"]}
              onSave={this.onSave("program-elements-collection")}
            />
          </Grid>
        </Section>

        <Section id="logistics" className="bg-secondary text-black">
          <Grid container>
            <Grid item xs={12} md={8}>
              <div className="">
                <h2 className="text-bold">
                  <EditableText content={content["logistics-title"]} onSave={this.onSave("logistics-title")} />
                </h2>
                <div className="font-size-h4">
                  <EditableText content={content["logistics-description"]} onSave={this.onSave("logistics-description")} />
                </div>
                <EditableParagraph content={content["logistics-details"]} onSave={this.onSave("logistics-details")} />
              </div>
            </Grid>
          </Grid>
        </Section>

        <Section id="gallery">
          <Grid container>
            <Grid item md={8} className="mb-4">
              <h2 className="text-bold">
                <EditableText content={content["gallery-title"]} onSave={this.onSave("gallery-title")} />
              </h2>
              <EditableParagraph classes="font-size-h4" content={content["gallery-description"]} onSave={this.onSave("gallery-description")} />
            </Grid>
            <Gallery content={content["gallery-collection"]} onSave={this.onSave("gallery-collection")} />
          </Grid>
        </Section>

        <Section id="participants">
          <Grid container>
            <Grid item md={8} className="mb-4">
              <h2 className="text-bold">
                <EditableText content={content["participants-title"]} onSave={this.onSave("participants-title")} />
              </h2>
              <EditableParagraph classes="font-size-h4" content={content["participants-description"]} onSave={this.onSave("participants-description")} />
            </Grid>
            <ParticipantGallery content={content["participants-collection"]} onSave={this.onSave("participants-collection")} />
          </Grid>
        </Section>
      </Layout>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);

export const query = graphql`
  query {
    pages(id: { eq: "home" }) {
      id
      content
      title
      description
      slug
    }
  }
`;


