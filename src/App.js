import * as React from "react";
import axios from "axios";
import "./App.css";
import { ReactComponent as Check } from "./check.svg";

const welcome = {
  greeting: "h3LL0", //key:value
  title: "hAcK3rS!", //key:value
};

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

/* const initialMovieList = [
  {
    title: "Five Deadly Venoms",
    url: "https://www.youtube.com/watch?v=0jMAciSVzcE",
    film_maker: " Shaw Brothers ",
    year: "1978",
    objectID: 0,
  },
  {
    title: " Evil Dead",
    url: "https://www.youtube.com/watch?v=d5hvzIxktFQ ",
    film_maker: " Sam Raimi",
    year: " 1981",
    objectID: 1,
  },
  {
    title: "The Thing",
    url: "https://www.youtube.com/watch?v=eke95-lTPnY ",
    film_maker: " John Carpenter",
    year: " 1982",
    objectID: 2,
  },
  {
    title: " Aliens",
    url: "https://www.youtube.com/watch?v=y5rAL5PPaSU ",
    film_maker: " James Cameron",
    year: " 1986",
    objectID: 3,
  },

  {
    title: " Hellraiser",
    url: "https://www.youtube.com/watch?v=8mOn4h0lgKQ ",
    film_maker: " Clive Barker",
    year: " 1987",
    objectID: 4,
  },
];
*/

const useSemiPersistentState = (key, initialState) => {
  const isMounted = React.useRef(false);

  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      console.log("A");
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
};

const storiesReducer = (state, action) => {
  switch (action.type) {
    case "SET_STORIES":
      return action.payload;
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "STORIES_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

const getSumComments = (stories) => {
  console.log("C");

  return stories.data.reduce((result, value) => result + value.num_comments, 0);
};

function App() {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");

  const [hackerList, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });

  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

  const handleFetchStories = React.useCallback(async () => {
    // if (!searchTerm) return;

    dispatchStories({ type: "STORIES_FETCH_INIT" });
    try {
      const result = await axios.get(url);

      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({ type: "SUCCESS_FETCH_FAILURE" });
    }
  }, [url]); //added searchTerm to avoid error

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  // const handleRemoveStory = (item) => {
  //   dispatchStories({
  //     type: "REMOVE_STORY",
  //     payload: item,
  //   });
  // };

  const handleRemoveStory = React.useCallback((item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  }, []);

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    event.preventDefault();
  };

  console.log("B:App");

  const sumComments = React.useMemo(
    () => getSumComments(hackerList),
    [hackerList]
  );

  return (
    <div className="container">
      <h1 className="headline-primary">
        {welcome.greeting} {welcome.title}
      </h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <p>
        Searching for<strong> {searchTerm} </strong>
        with <strong> {sumComments} </strong> comments.
      </p>

      <hr />

      <h3>My Hacker Lists:</h3>
      {hackerList.isError && <p>You fucked up!...</p>}
      {hackerList.isLoading ? (
        <p>
          busting loads <strong>8==D</strong> ------
        </p>
      ) : (
        <List list={hackerList.data} onRemoveItem={handleRemoveStory} />
      )}
      <hr />
    </div>
  );
}

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }) => (
  <form onSubmit={onSearchSubmit} className="search-form">
    <InputWithLabel
      id={searchTerm}
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search:</strong>
    </InputWithLabel>

    <button
      type="submit"
      disabled={!searchTerm}
      className="button button_large"
    >
      Submit
    </button>
  </form>
);

const InputWithLabel = ({
  id,
  value,
  type = "text",
  onInputChange,
  isFocused,
  children,
}) => {
  // A page 86 PDF useRef Hook
  const inputRef = React.useRef();

  // C page 86 PDF useEffect Hook- Video is different
  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id} className="label">
        {children}
      </label>
      &nbsp;
      {/* B page 86 PDF */}
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
        className="input"
      />
    </>
  );
};

// const List = ({ list, onRemoveItem }) => (
//   <ul>
//     {list.map((item) => (
//       <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
//     ))}
//   </ul>
// );

const List = React.memo(
  ({ list, onRemoveItem }) =>
    console.log("B:List") || (
      <ul>
        {list.map((item) => (
          <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
        ))}
      </ul>
    )
);

const Item = ({ item, onRemoveItem }) => (
  <li className="item">
    <span style={{ width: "40%" }}>
      <a href={item.url}>{item.title}</a>
    </span>
    <span style={{ width: "30%" }}>{item.author}</span>
    <span style={{ width: "10%" }}>{item.num_comments}</span>
    <span style={{ width: "10%" }}>{item.points}</span>
    <span style={{ width: "10%" }}>
      <button
        type="button"
        onClick={() => onRemoveItem(item)}
        className="button"
      >
        <Check height="18px" width="18px" />
      </button>
    </span>
  </li>
);

export default App;

//page 177 Testing in REACT for Lesson 4.1

//skip to page 204 React Project Structure for Lesson 5.1
