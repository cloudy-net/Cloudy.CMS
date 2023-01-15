﻿using Cloudy.CMS.UI.FieldSupport.Select;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TestWebsite.Models
{
    public class SimpleKeyTest
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Select<SimpleKeyTest>]
        public Tuple<Guid> RelatedPage { get; set; }

        [Select<SimpleKeyTest>]

        public Guid RelatedPage2 { get; set; }

        [Select<SimpleKeyTest>]
        public Guid? RelatedPage3 { get; set; }
    }
}
