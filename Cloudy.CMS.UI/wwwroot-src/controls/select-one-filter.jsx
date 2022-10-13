import debounce from "lodash.debounce";
import { useEffect, useMemo, useRef } from "preact/hooks";

export default ({ callback }) => {
  const debouncedResults = useMemo(() => {
    return debounce(event => callback(event.target.value), 250);
  }, []);

  useEffect(() => {
    return () => { // on unmount
      debouncedResults.cancel();
    };
  });

  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.focus();
  });

  return <div class="m-2">
    <input class="form-control form-control-sm" type="text" onInput={debouncedResults} ref={ref} />
  </div>
};