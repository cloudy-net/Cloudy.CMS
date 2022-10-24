﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cloudy.CMS.UI.FieldTypes.MediaPicker
{
    public record MediaProviderResult(
        IEnumerable<MediaProviderResultItem> Items,
        string ContinuationToken,
        int? TotalCount
    );
}
