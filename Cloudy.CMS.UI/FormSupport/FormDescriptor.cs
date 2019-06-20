﻿using Poetry.UI.FormSupport.FieldSupport;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace Poetry.UI.FormSupport
{
    [DebuggerDisplay("{Id}")]
    public class FormDescriptor
    {
        public string Id { get; }
        public Type Type { get; }

        public FormDescriptor(string id, Type type)
        {
            Id = id;
            Type = type;
        }
    }
}
